/**
 * React hooks for interacting with Academic Chain program
 */

import { useCallback, useState, useMemo } from 'react';
import { useWalletUi, useWalletUiSigner, type UiWalletAccount } from '@wallet-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import type { Address, TransactionSigner } from 'gill';
import { AccountRole } from 'gill';
import {
  createSolanaRpc,
  createTransaction,
  signAndSendTransactionMessageWithSigners,
  getBase58Decoder,
} from 'gill';
import {
  getProgram,
  getConnection,
  getConfigPda,
  getCoursePda,
  getEnrollmentPda,
  getStudentProfilePda,
  getStudentCreditAccount,
  fetchConfig,
  fetchCourse,
  fetchEnrollment,
  fetchStudentProfile,
  getCreditBalance,
  parseAnchorError,
  confirmTransaction,
  type AnchorWallet,
} from '@/lib/academic-chain';
import { DEVNET_RPC_URL } from '@/lib/academic-chain-client';
import { toast } from 'sonner';

/**
 * Hook to get an Anchor-compatible wallet from wallet-ui
 */
function useAnchorWallet(): AnchorWallet | null {
  const { account } = useWalletUi();

  const wallet = useMemo(() => {
    if (!account) {
      console.log('⚠️ useAnchorWallet: No account from wallet-ui');
      return null;
    }

    console.log('✅ useAnchorWallet: Creating wallet from account:', {
      address: account.address,
      addressSlice: account.address?.slice(0, 8) + '...',
    });

    return {
      publicKey: new PublicKey(account.address as Address),
      signTransaction: async <T extends Parameters<AnchorWallet['signTransaction']>[0]>(tx: T): Promise<T> => {
        // wallet-ui handles signing internally
        return tx;
      },
      signAllTransactions: async <T extends Parameters<AnchorWallet['signAllTransactions']>[0][0]>(txs: T[]): Promise<T[]> => {
        // wallet-ui handles signing internally
        return txs;
      },
    };
  }, [account]);

  return wallet;
}

/**
 * Hook to fetch program config
 */
export function useConfig() {
  const wallet = useAnchorWallet();

  return useQuery({
    queryKey: ['academic-chain', 'config'],
    queryFn: async () => {
      if (!wallet) throw new Error('Wallet not connected');
      const program = getProgram(wallet);
      return await fetchConfig(program);
    },
    enabled: !!wallet,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch course details
 */
export function useCourse(courseId: string | null) {
  const wallet = useAnchorWallet();

  return useQuery({
    queryKey: ['academic-chain', 'course', courseId],
    queryFn: async () => {
      if (!wallet || !courseId) return null;
      const program = getProgram(wallet);
      return await fetchCourse(program, courseId);
    },
    enabled: !!wallet && !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to check enrollment status
 */
export function useEnrollment(courseId: string | null) {
  const wallet = useAnchorWallet();

  return useQuery({
    queryKey: ['academic-chain', 'enrollment', wallet?.publicKey?.toString(), courseId],
    queryFn: async () => {
      if (!wallet || !courseId) return null;
      const program = getProgram(wallet);
      return await fetchEnrollment(program, wallet.publicKey, courseId);
    },
    enabled: !!wallet && !!courseId,
  });
}

/**
 * Hook to fetch student profile
 */
export function useStudentProfile() {
  const wallet = useAnchorWallet();

  return useQuery({
    queryKey: ['academic-chain', 'student-profile', wallet?.publicKey?.toString()],
    queryFn: async () => {
      if (!wallet) return null;
      const program = getProgram(wallet);
      return await fetchStudentProfile(program, wallet.publicKey);
    },
    enabled: !!wallet,
  });
}

/**
 * Hook to fetch credit balance
 */
export function useCreditBalance() {
  const wallet = useAnchorWallet();
  const { data: config, isLoading: configLoading, error: configError } = useConfig();

  const query = useQuery({
    queryKey: ['academic-chain', 'credit-balance', wallet?.publicKey?.toString()],
    queryFn: async () => {
      console.log('🔍 useCreditBalance queryFn called:', {
        hasWallet: !!wallet,
        hasConfig: !!config,
        walletPublicKey: wallet?.publicKey?.toString(),
        creditMint: config?.creditMint?.toString(),
      });

      if (!wallet || !config) {
        console.log('⚠️ Missing wallet or config:', { wallet: !!wallet, config: !!config });
        return 0;
      }

      const connection = getConnection();
      const balance = await getCreditBalance(connection, config.creditMint, wallet.publicKey);
      
      console.log('✅ Credit balance result:', balance);
      
      return balance;
    },
    enabled: !!wallet && !!config,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  console.log('📊 useCreditBalance state:', {
    hasWallet: !!wallet,
    hasConfig: !!config,
    configLoading,
    configError: !!configError,
    isEnabled: query.isEnabled,
    isLoading: query.isLoading,
    data: query.data,
  });

  return query;
}

/**
 * Hook for course registration
 */
export function useCourseRegistration() {
  const wallet = useAnchorWallet();
  const { account, connected } = useWalletUi();
  
  // useWalletUiSigner requires account to have specific structure
  // We'll only get a valid signer if account exists
  const shouldUseSigner = !!account;
  const transactionSigner = useWalletUiSigner({ 
    account: account as UiWalletAccount 
  });
  
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const registerCourse = useCallback(
    async (courseId: string) => {
      if (!wallet || !account || !transactionSigner || !connected || !shouldUseSigner) {
        throw new Error('Wallet not connected');
      }

      setIsProcessing(true);

      try {
        const program = getProgram(wallet);
        const connection = getConnection();

        // Find PDAs
        getConfigPda(program.programId);
        const [coursePda] = getCoursePda(courseId, program.programId);
        const [enrollmentPda] = getEnrollmentPda(wallet.publicKey, courseId, program.programId);
        getStudentProfilePda(wallet.publicKey, program.programId);

        // Fetch config to get credit mint
        const config = await fetchConfig(program);
        if (!config) {
          throw new Error('Program config not found. Is the program initialized?');
        }

        // Get student credit account
        const studentCreditAccount = getStudentCreditAccount(config.creditMint, wallet.publicKey);

        console.log('🔄 Registering for course:', courseId);
        console.log('Course PDA:', coursePda.toString());
        console.log('Enrollment PDA:', enrollmentPda.toString());
        console.log('Student Credit Account:', studentCreditAccount.toString());
        console.log('Transaction Signer:', transactionSigner.address);

        console.log('🏗️  Building Anchor instruction...');
        const instruction = await program.methods
          .registerCourse(courseId)
          .accounts({
            student: wallet.publicKey,
            creditMint: config.creditMint,
          })
          .instruction();

        console.log('✅ Instruction built successfully');
        console.log('Instruction accounts:', instruction.keys.map(key => ({
          pubkey: key.pubkey.toBase58(),
          isSigner: key.isSigner,
          isWritable: key.isWritable,
        })));

        // Create gill RPC client
        const rpc = createSolanaRpc(DEVNET_RPC_URL);

        // Get latest blockhash using gill
        console.log('🔗 Getting latest blockhash...');
        const { value: latestBlockhash } = await rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();
        console.log('✅ Blockhash retrieved');

        // Build transaction using gill
        console.log('📦 Creating transaction...');
        console.log('Transaction details:', {
          feePayerAddress: transactionSigner.address,
          programId: instruction.programId.toBase58(),
          accountsCount: instruction.keys.length,
          dataLength: instruction.data.length,
        });
        
        const transaction = createTransaction({
          feePayer: transactionSigner as TransactionSigner, // Use the proper TransactionSigner from useWalletUiSigner
          version: 0,
          latestBlockhash,
          instructions: [
            {
              programAddress: instruction.programId.toBase58() as Address,
              accounts: instruction.keys.map((key) => ({
                address: key.pubkey.toBase58() as Address,
                role: key.isSigner
                  ? key.isWritable
                    ? AccountRole.WRITABLE_SIGNER
                    : AccountRole.READONLY_SIGNER
                  : key.isWritable
                  ? AccountRole.WRITABLE
                  : AccountRole.READONLY,
              })),
              data: instruction.data,
            },
          ],
        });

        console.log('✅ Transaction created:', {
          version: transaction.version,
          instructionsCount: transaction.instructions.length,
          hasFeePayer: !!transaction.feePayer,
        });

        // Try to simulate the transaction first to get better error messages
        console.log('🧪 Simulating transaction first...');
        try {
          const tx = await program.methods
            .registerCourse(courseId)
            .accounts({
              student: wallet.publicKey,
              creditMint: config.creditMint,
            })
            .transaction();
          
          // Set the fee payer for simulation
          tx.feePayer = wallet.publicKey;
          tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
          
          const simulationResult = await connection.simulateTransaction(tx);
          
          console.log('✅ Simulation result:', simulationResult);
          
          if (simulationResult.value.err) {
            console.error('❌ Simulation failed:', simulationResult.value.err);
            console.error('Logs:', simulationResult.value.logs);
            
            // Check for specific errors
            const logs = simulationResult.value.logs || [];
            const errorLog = logs.join('\n');
            
            if (errorLog.includes('AccountNotInitialized') && errorLog.includes('course')) {
              throw new Error(
                `Course "${courseId}" has not been created on-chain yet.\n\n` +
                `The smart contract requires courses to be initialized before students can register.\n` +
                `Please contact the administrator to create this course first.\n\n` +
                `Note: The program currently doesn't have a create_course instruction implemented.`
              );
            }
            
            if (errorLog.includes('InsufficientCredits')) {
              throw new Error('You do not have enough credits to register for this course.');
            }
            
            if (errorLog.includes('AlreadyEnrolled')) {
              throw new Error('You are already enrolled in this course.');
            }
            
            throw new Error(`Transaction simulation failed: ${JSON.stringify(simulationResult.value.err)}\n\nLogs:\n${logs.join('\n')}`);
          }
        } catch (simError) {
          console.error('❌ Simulation error:', simError);
          // If simulation failed with a clear error, don't continue
          if (simError instanceof Error && simError.message.includes('simulation failed')) {
            throw simError;
          }
          // Otherwise continue - simulation might fail for different reasons
        }

        console.log('✍️  Signing and sending transaction...');
        try {
          const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction);
          const signature = getBase58Decoder().decode(signatureBytes);
          
          console.log('✅ Transaction signature:', signature);

          // Wait for confirmation
          await confirmTransaction(connection, signature);

          console.log('✅ Course registration confirmed!');

          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: ['academic-chain', 'enrollment'] });
          queryClient.invalidateQueries({ queryKey: ['academic-chain', 'credit-balance'] });
          queryClient.invalidateQueries({ queryKey: ['academic-chain', 'student-profile'] });

          toast.success('✅ Successfully enrolled in course!');

          return signature;
        } catch (signError) {
          console.error('❌ Sign and send error:', signError);
          console.error('Error details:', {
            message: signError instanceof Error ? signError.message : 'Unknown error',
            name: signError instanceof Error ? signError.name : undefined,
            stack: signError instanceof Error ? signError.stack : undefined,
            fullError: JSON.stringify(signError, null, 2),
          });
          
          // Check if it's a wallet rejection
          if (signError instanceof Error) {
            const msg = signError.message.toLowerCase();
            if (msg.includes('user rejected') || msg.includes('rejected')) {
              throw new Error('Transaction was rejected by the user');
            }
            if (msg.includes('unexpected error')) {
              throw new Error('Wallet signing failed. Please check: 1) Sufficient SOL for fees, 2) Account has required credits, 3) Try reconnecting wallet');
            }
          }
          
          throw signError;
        }
      } catch (error) {
        console.error('❌ Course registration failed:', error);
        const errorMessage = parseAnchorError(error);
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [wallet, account, transactionSigner, connected, shouldUseSigner, queryClient]
  );

  return {
    registerCourse,
    isProcessing,
  };
}

/**
 * Hook for purchasing credits
 */
export function usePurchaseCredits() {
  const wallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      const program = getProgram(wallet);
      const connection = getConnection();

      // Find PDAs
      getConfigPda(program.programId);
      getStudentProfilePda(wallet.publicKey, program.programId);

      // Fetch config
      const config = await fetchConfig(program);
      if (!config) {
        throw new Error('Program config not found');
      }

      // Get student credit account
      getStudentCreditAccount(config.creditMint, wallet.publicKey);

      console.log('🔄 Purchasing credits:', amount);

      // Build and send transaction
      const tx = await program.methods
        .purchaseCredits(new BN(amount))
        .accounts({
          student: wallet.publicKey,
          treasury: config.treasury,
          creditMint: config.creditMint,
        })
        .rpc();

      console.log('✅ Transaction signature:', tx);

      // Wait for confirmation
      await confirmTransaction(connection, tx);

      console.log('✅ Credit purchase confirmed!');

      return tx;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['academic-chain', 'credit-balance'] });
      queryClient.invalidateQueries({ queryKey: ['academic-chain', 'student-profile'] });
      toast.success('✅ Credits purchased successfully!');
    },
    onError: (error) => {
      console.error('❌ Credit purchase failed:', error);
      const errorMessage = parseAnchorError(error);
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to check if student can afford a course
 */
export function useCanAffordCourse(requiredCredits: number) {
  const { data: creditBalance = 0 } = useCreditBalance();
  return creditBalance >= requiredCredits;
}

/**
 * Hook to check if student is enrolled in a course
 */
export function useIsEnrolled(courseId: string | null) {
  const { data: enrollment } = useEnrollment(courseId);
  return !!enrollment;
}

/**
 * Combined hook for course registration page
 */
export function useCourseRegistrationPage(courseId: string) {
  const wallet = useAnchorWallet();
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: enrollment, isLoading: enrollmentLoading } = useEnrollment(courseId);
  const { data: creditBalance = 0, isLoading: balanceLoading } = useCreditBalance();
  const { registerCourse, isProcessing } = useCourseRegistration();

  const isLoading = courseLoading || enrollmentLoading || balanceLoading;
  const isEnrolled = !!enrollment;
  const canAfford = course ? creditBalance >= course.requiredCredits : false;
  const canRegister = !isEnrolled && canAfford && !!course && course.isActive;

  return {
    wallet,
    course,
    enrollment,
    creditBalance,
    isLoading,
    isEnrolled,
    canAfford,
    canRegister,
    isProcessing,
    registerCourse,
  };
}

/**
 * Hook to check if a course exists on-chain
 */
export function useCourseExists(courseId: string | null) {
  const wallet = useAnchorWallet();

  return useQuery({
    queryKey: ['academic-chain', 'course-exists', courseId],
    queryFn: async () => {
      if (!wallet || !courseId) return false;
      const program = getProgram(wallet);
      const course = await fetchCourse(program, courseId);
      return !!course;
    },
    enabled: !!wallet && !!courseId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook for creating a course
 */
export function useCreateCourse() {
  const wallet = useAnchorWallet();
  const { account, connected } = useWalletUi();
  
  // Guard: only use signer if account exists
  // Pass null coalescing to prevent accessing undefined.chains
  const transactionSigner = useWalletUiSigner({ 
    account: (account ?? null) as UiWalletAccount 
  });
  
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const createCourse = useCallback(
    async (params: {
      courseId: string;
      courseName: string;
      instructor: string;
      requiredCredits: number;
    }) => {
      if (!wallet || !account || !transactionSigner || !connected) {
        throw new Error('Wallet not connected');
      }

      setIsProcessing(true);

      try {
        const program = getProgram(wallet);
        const connection = getConnection();

        console.log('🔄 Creating course:', params.courseId);

        // Derive course PDA using helper to avoid Anchor auto-generating a new keypair signer
        const [coursePda] = getCoursePda(params.courseId, program.programId);

        // Build instruction using Anchor
        const instruction = await program.methods
          .createCourse(
            params.courseId,
            params.courseName,
            new PublicKey(params.instructor),
            new BN(params.requiredCredits)
          )
          .accounts({
            authority: wallet.publicKey,
            course: coursePda,
            systemProgram: SystemProgram.programId,
          })
          .instruction();

        console.log('✅ Instruction built successfully');
        console.log('📋 Instruction details:', {
          programId: instruction.programId.toBase58(),
          accountsCount: instruction.keys.length,
          accounts: instruction.keys.map((k: { pubkey: PublicKey; isSigner: boolean; isWritable: boolean }) => ({
            pubkey: k.pubkey.toBase58(),
            isSigner: k.isSigner,
            isWritable: k.isWritable,
          })),
          dataLength: instruction.data.length,
        });

        // Create gill RPC client
        const rpc = createSolanaRpc(DEVNET_RPC_URL);

        // Get latest blockhash
        const { value: latestBlockhash } = await rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();

        // Build transaction using gill
        const transaction = createTransaction({
          feePayer: transactionSigner as TransactionSigner,
          version: 0,
          latestBlockhash,
          instructions: [
            {
              programAddress: instruction.programId.toBase58() as Address,
              accounts: instruction.keys.map((key: { pubkey: PublicKey; isSigner: boolean; isWritable: boolean }) => ({
                address: key.pubkey.toBase58() as Address,
                role: key.isSigner
                  ? key.isWritable
                    ? AccountRole.WRITABLE_SIGNER
                    : AccountRole.READONLY_SIGNER
                  : key.isWritable
                  ? AccountRole.WRITABLE
                  : AccountRole.READONLY,
              })),
              data: instruction.data,
            },
          ],
        });

        console.log('📦 Transaction built:', {
          feePayer: account.address,
          instructionsCount: transaction.instructions.length,
        });

        console.log('✍️  Signing and sending transaction...');
        let signatureBytes;
        try {
          signatureBytes = await signAndSendTransactionMessageWithSigners(transaction);
        } catch (signingError) {
          console.error('❌ Signing/sending failed:', signingError);
          console.error('Error details:', {
            message: signingError instanceof Error ? signingError.message : String(signingError),
            name: signingError instanceof Error ? signingError.name : 'Unknown',
            stack: signingError instanceof Error ? signingError.stack : undefined,
          });
          throw new Error(`Transaction signing failed: ${signingError instanceof Error ? signingError.message : 'Unknown error'}`);
        }
        
        const signature = getBase58Decoder().decode(signatureBytes);

        console.log('✅ Transaction signature:', signature);

        // Wait for confirmation
        await confirmTransaction(connection, signature);

        console.log('✅ Course created successfully!');

        // Invalidate course queries
        queryClient.invalidateQueries({ queryKey: ['academic-chain', 'course'] });
        queryClient.invalidateQueries({ queryKey: ['academic-chain', 'course-exists'] });

        toast.success(`✅ Course "${params.courseId}" created successfully!`);

        return signature;
      } catch (error) {
        console.error('❌ Course creation failed:', error);
        const errorMessage = parseAnchorError(error);
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [wallet, account, transactionSigner, connected, queryClient]
  );

  return {
    createCourse,
    isProcessing,
  };
}
