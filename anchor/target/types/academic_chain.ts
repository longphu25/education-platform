/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/academic_chain.json`.
 */
export type AcademicChain = {
  "address": "9HuNte7WjS8GVHBKpE42y1QXq4C7e6uNvtjmDRM1G99F",
  "metadata": {
    "name": "academicChain",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Decentralized academic credit and certification system"
  },
  "instructions": [
    {
      "name": "claimGraduation",
      "docs": [
        "Claim graduation NFT"
      ],
      "discriminator": [
        87,
        121,
        87,
        168,
        63,
        70,
        91,
        158
      ],
      "accounts": [
        {
          "name": "student",
          "writable": true,
          "signer": true
        },
        {
          "name": "studentProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  117,
                  100,
                  101,
                  110,
                  116,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "student"
              }
            ]
          }
        },
        {
          "name": "graduationMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  114,
                  97,
                  100,
                  117,
                  97,
                  116,
                  105,
                  111,
                  110,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "student"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "requiredCourses",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "completeCourse",
      "docs": [
        "Mark course as completed"
      ],
      "discriminator": [
        91,
        113,
        236,
        190,
        183,
        191,
        2,
        63
      ],
      "accounts": [
        {
          "name": "instructor",
          "writable": true,
          "signer": true
        },
        {
          "name": "course",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  117,
                  114,
                  115,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "courseId"
              }
            ]
          }
        },
        {
          "name": "student"
        },
        {
          "name": "enrollment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  110,
                  114,
                  111,
                  108,
                  108,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "student"
              },
              {
                "kind": "arg",
                "path": "courseId"
              }
            ]
          }
        },
        {
          "name": "studentProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  117,
                  100,
                  101,
                  110,
                  116,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "student"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "courseId",
          "type": "string"
        },
        {
          "name": "grade",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createCourse",
      "docs": [
        "Create a new course"
      ],
      "discriminator": [
        120,
        121,
        154,
        164,
        107,
        180,
        167,
        241
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "course",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  117,
                  114,
                  115,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "courseId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "courseId",
          "type": "string"
        },
        {
          "name": "courseName",
          "type": "string"
        },
        {
          "name": "instructor",
          "type": "pubkey"
        },
        {
          "name": "requiredCredits",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the program"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "treasury"
        },
        {
          "name": "creditMint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "mintCertificate",
      "docs": [
        "Mint NFT certificate"
      ],
      "discriminator": [
        53,
        2,
        104,
        84,
        51,
        197,
        179,
        10
      ],
      "accounts": [
        {
          "name": "student",
          "writable": true,
          "signer": true
        },
        {
          "name": "course",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  117,
                  114,
                  115,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "courseId"
              }
            ]
          }
        },
        {
          "name": "enrollment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  110,
                  114,
                  111,
                  108,
                  108,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "student"
              },
              {
                "kind": "arg",
                "path": "courseId"
              }
            ]
          }
        },
        {
          "name": "certificateMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  101,
                  114,
                  116,
                  105,
                  102,
                  105,
                  99,
                  97,
                  116,
                  101,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "student"
              },
              {
                "kind": "arg",
                "path": "courseId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "courseId",
          "type": "string"
        },
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "purchaseCredits",
      "docs": [
        "Purchase credit tokens"
      ],
      "discriminator": [
        228,
        95,
        55,
        42,
        168,
        253,
        222,
        216
      ],
      "accounts": [
        {
          "name": "student",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "creditMint",
          "writable": true
        },
        {
          "name": "studentCreditAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "student"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "creditMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "studentProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  117,
                  100,
                  101,
                  110,
                  116,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "student"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "registerCourse",
      "docs": [
        "Register for a course"
      ],
      "discriminator": [
        254,
        131,
        130,
        70,
        100,
        68,
        139,
        121
      ],
      "accounts": [
        {
          "name": "student",
          "writable": true,
          "signer": true
        },
        {
          "name": "course",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  117,
                  114,
                  115,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "courseId"
              }
            ]
          }
        },
        {
          "name": "enrollment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  110,
                  114,
                  111,
                  108,
                  108,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "student"
              },
              {
                "kind": "arg",
                "path": "courseId"
              }
            ]
          }
        },
        {
          "name": "studentProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  117,
                  100,
                  101,
                  110,
                  116,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "student"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "creditMint",
          "writable": true
        },
        {
          "name": "studentCreditAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "student"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "creditMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "courseId",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "course",
      "discriminator": [
        206,
        6,
        78,
        228,
        163,
        138,
        241,
        106
      ]
    },
    {
      "name": "courseEnrollment",
      "discriminator": [
        119,
        94,
        144,
        89,
        26,
        179,
        54,
        137
      ]
    },
    {
      "name": "programConfig",
      "discriminator": [
        196,
        210,
        90,
        231,
        144,
        149,
        140,
        63
      ]
    },
    {
      "name": "studentProfile",
      "discriminator": [
        185,
        172,
        160,
        26,
        178,
        113,
        216,
        235
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientCredits",
      "msg": "Insufficient credits to register for this course"
    },
    {
      "code": 6001,
      "name": "courseNotActive",
      "msg": "Course is not active"
    },
    {
      "code": 6002,
      "name": "alreadyEnrolled",
      "msg": "Student already enrolled in this course"
    },
    {
      "code": 6003,
      "name": "courseNotCompleted",
      "msg": "Course not completed yet"
    },
    {
      "code": 6004,
      "name": "invalidGrade",
      "msg": "Invalid grade value (must be 0-100)"
    },
    {
      "code": 6005,
      "name": "unauthorizedInstructor",
      "msg": "Unauthorized: Only instructor can perform this action"
    },
    {
      "code": 6006,
      "name": "certificateAlreadyMinted",
      "msg": "Certificate already minted for this course"
    },
    {
      "code": 6007,
      "name": "requirementsNotMet",
      "msg": "Not all required courses completed"
    },
    {
      "code": 6008,
      "name": "invalidCourseId",
      "msg": "Invalid course ID format"
    },
    {
      "code": 6009,
      "name": "invalidCourseName",
      "msg": "Invalid course name"
    },
    {
      "code": 6010,
      "name": "invalidCredits",
      "msg": "Invalid credits amount"
    },
    {
      "code": 6011,
      "name": "unauthorized",
      "msg": "Unauthorized: Only program authority can perform this action"
    },
    {
      "code": 6012,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow"
    }
  ],
  "types": [
    {
      "name": "course",
      "docs": [
        "Course information"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "courseId",
            "type": "string"
          },
          {
            "name": "courseName",
            "type": "string"
          },
          {
            "name": "instructor",
            "type": "pubkey"
          },
          {
            "name": "requiredCredits",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "courseEnrollment",
      "docs": [
        "Student course enrollment"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "student",
            "type": "pubkey"
          },
          {
            "name": "courseId",
            "type": "string"
          },
          {
            "name": "creditsPaid",
            "type": "u64"
          },
          {
            "name": "enrollmentDate",
            "type": "i64"
          },
          {
            "name": "completionDate",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "isCompleted",
            "type": "bool"
          },
          {
            "name": "grade",
            "type": "u8"
          },
          {
            "name": "certificateMint",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "programConfig",
      "docs": [
        "Program configuration"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "creditMint",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "creditPrice",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "studentProfile",
      "docs": [
        "Student profile"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "student",
            "type": "pubkey"
          },
          {
            "name": "totalCreditsPurchased",
            "type": "u64"
          },
          {
            "name": "totalCreditsSpent",
            "type": "u64"
          },
          {
            "name": "coursesCompleted",
            "type": "u16"
          },
          {
            "name": "graduationNft",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "certificateMintSeed",
      "type": "bytes",
      "value": "[99, 101, 114, 116, 105, 102, 105, 99, 97, 116, 101, 95, 109, 105, 110, 116]"
    },
    {
      "name": "courseSeed",
      "type": "bytes",
      "value": "[99, 111, 117, 114, 115, 101]"
    },
    {
      "name": "enrollmentSeed",
      "type": "bytes",
      "value": "[101, 110, 114, 111, 108, 108, 109, 101, 110, 116]"
    },
    {
      "name": "graduationMintSeed",
      "type": "bytes",
      "value": "[103, 114, 97, 100, 117, 97, 116, 105, 111, 110, 95, 109, 105, 110, 116]"
    },
    {
      "name": "programConfigSeed",
      "type": "bytes",
      "value": "[99, 111, 110, 102, 105, 103]"
    },
    {
      "name": "studentProfileSeed",
      "type": "bytes",
      "value": "[115, 116, 117, 100, 101, 110, 116, 95, 112, 114, 111, 102, 105, 108, 101]"
    }
  ]
};
