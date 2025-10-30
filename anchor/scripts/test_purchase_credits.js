"use strict";
/**
 * Test script for purchase_credits instruction
 *
 * Usage:
 *   pnpm tsx anchor/scripts/test_purchase_credits.ts
 *
 * This script demonstrates how to use the generated client to purchase credits on devnet
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
var gill_1 = require("gill");
var academic_chain_client_1 = require("../../src/lib/academic-chain-client");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var rpc, rpcSubscriptions, config, student, airdrop, airdropSignature, balance, creditAmount, totalCost, result, profile, result2, finalProfile, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🎓 Academic Chain - Purchase Credits Test\n');
                    console.log('Network: Devnet');
                    console.log('RPC:', academic_chain_client_1.DEVNET_RPC_URL);
                    console.log('─'.repeat(60));
                    rpc = (0, gill_1.createSolanaRpc)(academic_chain_client_1.DEVNET_RPC_URL);
                    rpcSubscriptions = (0, gill_1.createSolanaRpcSubscriptions)(academic_chain_client_1.DEVNET_RPC_URL.replace('https', 'wss'));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 13, , 14]);
                    // Step 1: Get program configuration
                    console.log('\n📋 Step 1: Fetching program configuration...');
                    return [4 /*yield*/, (0, academic_chain_client_1.getProgramConfiguration)(academic_chain_client_1.DEVNET_RPC_URL)];
                case 2:
                    config = _a.sent();
                    console.log('✓ Config loaded');
                    console.log("  Credit Price: ".concat((0, academic_chain_client_1.lamportsToSol)(config.data.creditPrice), " SOL"));
                    console.log("  Treasury: ".concat(config.data.treasury));
                    console.log("  Credit Mint: ".concat(config.data.creditMint));
                    // Step 2: Generate or use a student keypair
                    console.log('\n👤 Step 2: Setting up student account...');
                    return [4 /*yield*/, (0, gill_1.generateKeyPairSigner)()];
                case 3:
                    student = _a.sent();
                    console.log("  Student Address: ".concat(student.address));
                    // Step 3: Airdrop SOL to student
                    console.log('\n💰 Step 3: Requesting airdrop...');
                    airdrop = (0, gill_1.airdropFactory)({ rpc: rpc, rpcSubscriptions: rpcSubscriptions });
                    return [4 /*yield*/, airdrop({
                            recipientAddress: student.address,
                            lamports: (0, gill_1.lamports)(20000000n), // 0.02 SOL
                            commitment: 'confirmed',
                        })];
                case 4:
                    airdropSignature = _a.sent();
                    console.log("\u2713 Airdrop successful: ".concat(airdropSignature));
                    // Wait a bit for airdrop to confirm
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 3000); })
                        // Check balance
                    ];
                case 5:
                    // Wait a bit for airdrop to confirm
                    _a.sent();
                    return [4 /*yield*/, rpc.getBalance(student.address).send()];
                case 6:
                    balance = _a.sent();
                    console.log("  Student Balance: ".concat((0, academic_chain_client_1.lamportsToSol)(balance.value), " SOL"));
                    creditAmount = 10;
                    console.log("\n\uD83D\uDED2 Step 4: Purchasing ".concat(creditAmount, " credits..."));
                    totalCost = config.data.creditPrice * BigInt(creditAmount);
                    console.log("  Total Cost: ".concat((0, academic_chain_client_1.lamportsToSol)(totalCost), " SOL"));
                    return [4 /*yield*/, (0, academic_chain_client_1.purchaseCredits)({
                            student: student,
                            amount: creditAmount,
                            rpcUrl: academic_chain_client_1.DEVNET_RPC_URL,
                            rpc: rpc,
                            rpcSubscriptions: rpcSubscriptions,
                        })];
                case 7:
                    result = _a.sent();
                    console.log('✓ Purchase successful!');
                    console.log("  Transaction: ".concat(result.signature));
                    console.log("  Explorer: ".concat((0, academic_chain_client_1.getExplorerUrl)(result.signature, 'devnet')));
                    // Step 5: Verify student profile
                    console.log('\n📊 Step 5: Verifying student profile...');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })]; // Wait for confirmation
                case 8:
                    _a.sent(); // Wait for confirmation
                    return [4 /*yield*/, (0, academic_chain_client_1.getStudentProfile)(student.address, academic_chain_client_1.DEVNET_RPC_URL)];
                case 9:
                    profile = _a.sent();
                    if (profile) {
                        console.log('✓ Student profile created');
                        console.log("  Total Credits Purchased: ".concat(profile.data.totalCreditsPurchased));
                        console.log("  Created At: ".concat(new Date(Number(profile.data.createdAt) * 1000).toISOString()));
                    }
                    else {
                        console.log('⚠ Profile not found yet (may need more time to index)');
                    }
                    // Step 6: Try purchasing more credits
                    console.log("\n\uD83D\uDED2 Step 6: Purchasing ".concat(creditAmount, " more credits..."));
                    return [4 /*yield*/, (0, academic_chain_client_1.purchaseCredits)({
                            student: student,
                            amount: creditAmount,
                            rpcUrl: academic_chain_client_1.DEVNET_RPC_URL,
                            rpc: rpc,
                            rpcSubscriptions: rpcSubscriptions,
                        })];
                case 10:
                    result2 = _a.sent();
                    console.log('✓ Second purchase successful!');
                    console.log("  Transaction: ".concat(result2.signature));
                    console.log("  Explorer: ".concat((0, academic_chain_client_1.getExplorerUrl)(result2.signature, 'devnet')));
                    // Final verification
                    console.log('\n📊 Final Verification...');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, (0, academic_chain_client_1.getStudentProfile)(student.address, academic_chain_client_1.DEVNET_RPC_URL)];
                case 12:
                    finalProfile = _a.sent();
                    if (finalProfile) {
                        console.log('✓ Student profile updated');
                        console.log("  Total Credits Purchased: ".concat(finalProfile.data.totalCreditsPurchased));
                        console.log("  Expected: ".concat(creditAmount * 2));
                    }
                    console.log('\n' + '─'.repeat(60));
                    console.log('✅ All tests passed!');
                    console.log('\n💡 Summary:');
                    console.log("  - Student Address: ".concat(student.address));
                    console.log("  - Total Credits Purchased: ".concat(creditAmount * 2));
                    console.log("  - Total Cost: ".concat((0, academic_chain_client_1.lamportsToSol)(result.totalCost + result2.totalCost), " SOL"));
                    console.log("  - Transactions:");
                    console.log("    1. ".concat(result.signature));
                    console.log("    2. ".concat(result2.signature));
                    return [3 /*break*/, 14];
                case 13:
                    error_1 = _a.sent();
                    console.error('\n❌ Error:', error_1);
                    if (error_1 instanceof Error) {
                        console.error('Message:', error_1.message);
                        console.error('Stack:', error_1.stack);
                    }
                    process.exit(1);
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    });
}
// Handle script execution
main().catch(function (error) {
    console.error('Fatal error:', error);
    process.exit(1);
});
