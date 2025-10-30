"use strict";
/**
 * Academic Chain Program Client Utilities
 * Helper functions for interacting with the academic_chain program on devnet
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEVNET_WS_URL = exports.DEVNET_RPC_URL = void 0;
exports.purchaseCredits = purchaseCredits;
exports.getStudentProfile = getStudentProfile;
exports.getProgramConfiguration = getProgramConfiguration;
exports.lamportsToSol = lamportsToSol;
exports.solToLamports = solToLamports;
exports.getExplorerUrl = getExplorerUrl;
exports.getAddressExplorerUrl = getAddressExplorerUrl;
var academic_chain_1 = require("../../anchor/src/client/js/academic-chain");
var gill_1 = require("gill");
exports.DEVNET_RPC_URL = 'https://api.devnet.solana.com';
exports.DEVNET_WS_URL = 'wss://api.devnet.solana.com';
/**
 * Purchase credits for a student account
 */
function purchaseCredits(params) {
    return __awaiter(this, void 0, void 0, function () {
        var rpcUrl, rpc, rpcSubscriptions, configPda, config, configError_1, totalCost, instruction, latestBlockhash, transaction, signedTransaction, signature, sendAndConfirm, error_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rpcUrl = params.rpcUrl || exports.DEVNET_RPC_URL;
                    rpc = params.rpc || (0, gill_1.createSolanaRpc)(rpcUrl);
                    rpcSubscriptions = params.rpcSubscriptions || (0, gill_1.createSolanaRpcSubscriptions)(rpcUrl.replace('https', 'wss'));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 11, , 12]);
                    console.log('🚀 Purchase credits initiated:', {
                        studentAddress: params.student.address,
                        amount: params.amount,
                        rpcUrl: rpcUrl,
                        programId: academic_chain_1.ACADEMIC_CHAIN_PROGRAM_ADDRESS,
                    });
                    // Validate student signer
                    if (!params.student || !params.student.address) {
                        throw new Error('Invalid wallet signer. Please reconnect your wallet.');
                    }
                    // Fetch program config
                    console.log('📋 Fetching program configuration...');
                    return [4 /*yield*/, getProgramDerivedAddress({
                            programAddress: (0, gill_1.address)(academic_chain_1.ACADEMIC_CHAIN_PROGRAM_ADDRESS),
                            seeds: [new TextEncoder().encode('config')],
                        })];
                case 2:
                    configPda = (_a.sent())[0];
                    console.log('📍 Config PDA:', configPda);
                    config = void 0;
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, academic_chain_1.fetchProgramConfig)(rpc, configPda)];
                case 4:
                    config = _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    configError_1 = _a.sent();
                    console.error('❌ Failed to fetch program config:', configError_1);
                    throw new Error('Program not initialized. The academic chain program needs to be initialized first. ' +
                        'Please contact the administrator or check if you are connected to the correct network (devnet/mainnet).');
                case 6:
                    console.log('✅ Config fetched:', {
                        creditPrice: config.data.creditPrice.toString(),
                        creditPriceSOL: lamportsToSol(config.data.creditPrice),
                        treasury: config.data.treasury,
                        creditMint: config.data.creditMint,
                    });
                    totalCost = config.data.creditPrice * BigInt(params.amount);
                    console.log('💰 Total cost:', {
                        lamports: totalCost.toString(),
                        sol: lamportsToSol(totalCost),
                    });
                    // Check if amount is valid
                    if (params.amount <= 0) {
                        throw new Error('Amount must be greater than 0');
                    }
                    // Create instruction
                    console.log('📝 Creating purchase instruction...');
                    return [4 /*yield*/, (0, academic_chain_1.getPurchaseCreditsInstructionAsync)({
                            student: params.student,
                            treasury: config.data.treasury,
                            creditMint: config.data.creditMint,
                            amount: BigInt(params.amount),
                        })];
                case 7:
                    instruction = _a.sent();
                    console.log('✅ Instruction created:', {
                        programAddress: instruction.programAddress,
                        accountsCount: instruction.accounts.length,
                        studentAccount: instruction.accounts[0],
                    });
                    // Verify the student signer
                    console.log('🔍 Verifying student signer:', {
                        address: params.student.address,
                        signerType: 'signTransactions' in params.student ? 'signTransactions' : 'modifyAndSignTransactions',
                    });
                    // Build and send transaction
                    console.log('🔗 Getting latest blockhash...');
                    return [4 /*yield*/, rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()];
                case 8:
                    latestBlockhash = (_a.sent()).value;
                    console.log('✅ Blockhash retrieved:', {
                        blockhash: latestBlockhash.blockhash,
                        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                    });
                    console.log('🏗️  Building transaction...');
                    transaction = (0, gill_1.createTransaction)({
                        feePayer: params.student,
                        version: 0,
                        latestBlockhash: latestBlockhash,
                        instructions: [instruction],
                    });
                    console.log('✍️  Signing transaction...');
                    return [4 /*yield*/, (0, gill_1.signTransactionMessageWithSigners)(transaction)];
                case 9:
                    signedTransaction = _a.sent();
                    signature = (0, gill_1.getSignatureFromTransaction)(signedTransaction);
                    console.log('✅ Transaction signed:', signature);
                    console.log('📤 Sending transaction to network...');
                    sendAndConfirm = (0, gill_1.sendAndConfirmTransactionFactory)({
                        rpc: rpc,
                        rpcSubscriptions: rpcSubscriptions,
                    });
                    return [4 /*yield*/, sendAndConfirm(signedTransaction, {
                            commitment: 'confirmed',
                            skipPreflight: false,
                        })];
                case 10:
                    _a.sent();
                    console.log('✅ Transaction confirmed:', signature);
                    return [2 /*return*/, {
                            signature: signature,
                            amount: params.amount,
                            totalCost: totalCost,
                        }];
                case 11:
                    error_1 = _a.sent();
                    console.error('❌ Error in purchaseCredits:', error_1);
                    // Provide more helpful error messages
                    if (error_1 instanceof Error) {
                        errorMessage = error_1.message.toLowerCase();
                        // Wallet connection errors
                        if (errorMessage.includes('wallet') || errorMessage.includes('signer')) {
                            throw new Error('Wallet connection lost. Please reconnect your wallet and try again.');
                        }
                        // Balance errors
                        if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
                            throw new Error('Insufficient SOL balance. Please add more SOL to your wallet.');
                        }
                        // Transaction errors
                        if (errorMessage.includes('blockhash') || errorMessage.includes('expired')) {
                            throw new Error('Transaction expired. Please try again.');
                        }
                        // User rejection
                        if (errorMessage.includes('user rejected') || errorMessage.includes('rejected')) {
                            throw new Error('Transaction was rejected. Please approve the transaction in your wallet.');
                        }
                        // Signature verification errors
                        if (errorMessage.includes('signature')) {
                            throw new Error('Signature verification failed. Please try again.');
                        }
                        // Network errors
                        if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
                            throw new Error('Network error. Please check your connection and try again.');
                        }
                        // Re-throw the original error if it's already user-friendly
                        if (error_1.message.length < 100 && !errorMessage.includes('0x')) {
                            throw error_1;
                        }
                        // Generic error with original message
                        throw new Error("Failed to purchase credits: ".concat(error_1.message));
                    }
                    throw new Error('Failed to purchase credits. Please try again.');
                case 12: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get student profile information
 */
function getStudentProfile(studentAddress, rpcUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var rpc, studentProfilePda, profile, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    rpc = (0, gill_1.createSolanaRpc)(rpcUrl || exports.DEVNET_RPC_URL);
                    return [4 /*yield*/, getProgramDerivedAddress({
                            programAddress: (0, gill_1.address)(academic_chain_1.ACADEMIC_CHAIN_PROGRAM_ADDRESS),
                            seeds: [
                                new TextEncoder().encode('student_profile'),
                                new Uint8Array((0, gill_1.getAddressEncoder)().encode(studentAddress)),
                            ],
                        })];
                case 1:
                    studentProfilePda = (_b.sent())[0];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, academic_chain_1.fetchStudentProfile)(rpc, studentProfilePda)];
                case 3:
                    profile = _b.sent();
                    return [2 /*return*/, profile];
                case 4:
                    _a = _b.sent();
                    // Profile doesn't exist yet
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get program configuration
 */
function getProgramConfiguration(rpcUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var rpc, configPda, config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rpc = (0, gill_1.createSolanaRpc)(rpcUrl || exports.DEVNET_RPC_URL);
                    return [4 /*yield*/, getProgramDerivedAddress({
                            programAddress: (0, gill_1.address)(academic_chain_1.ACADEMIC_CHAIN_PROGRAM_ADDRESS),
                            seeds: [new TextEncoder().encode('config')],
                        })];
                case 1:
                    configPda = (_a.sent())[0];
                    return [4 /*yield*/, (0, academic_chain_1.fetchProgramConfig)(rpc, configPda)];
                case 2:
                    config = _a.sent();
                    return [2 /*return*/, config];
            }
        });
    });
}
/**
 * Helper to derive program derived addresses
 */
function getProgramDerivedAddress(params) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, getPda, getBytesEncoder;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('gill'); })];
                case 1:
                    _a = _b.sent(), getPda = _a.getProgramDerivedAddress, getBytesEncoder = _a.getBytesEncoder;
                    return [2 /*return*/, getPda({
                            programAddress: params.programAddress,
                            seeds: params.seeds.map(function (seed) { return getBytesEncoder().encode(seed); }),
                        })];
            }
        });
    });
}
/**
 * Format lamports to SOL
 */
function lamportsToSol(lamports) {
    var amount = typeof lamports === 'bigint' ? Number(lamports) : lamports;
    return (amount / 1000000000).toFixed(4);
}
/**
 * Format SOL to lamports
 */
function solToLamports(sol) {
    return BigInt(Math.floor(sol * 1000000000));
}
/**
 * Get explorer URL for transaction
 */
function getExplorerUrl(signature, cluster) {
    if (cluster === void 0) { cluster = 'devnet'; }
    return "https://explorer.solana.com/tx/".concat(signature, "?cluster=").concat(cluster);
}
/**
 * Get explorer URL for address
 */
function getAddressExplorerUrl(addressStr, cluster) {
    if (cluster === void 0) { cluster = 'devnet'; }
    return "https://explorer.solana.com/address/".concat(addressStr, "?cluster=").concat(cluster);
}
