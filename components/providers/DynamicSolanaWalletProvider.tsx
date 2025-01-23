"use client";

import {
    DynamicContextProvider,
} from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import * as React from "react";
import { useRouter } from "next/navigation";

export const sidebarCss = `
    @media (min-width: 768px) {
        .accordion-item {
            max-height: 100vh !important;
        }

        .modal, .dynamic-widget-modal, .dynamic-widget-card {
            right: 0 !important;
            top: 0 !important;
            transform: none !important;
            height: 100vh !important;
            border-radius: 0 !important;
            left: auto !important;
            background-color: #020817 !important; /* Updated background */
            color: #ffffff !important; /* Ensuring text contrast */
        }

        .wallet-list__scroll-container {
            max-height: 80vh !important;
            background-color: #020817 !important; /* Updated background */
        }

        .settings-view__body {
            height: auto !important;
            background-color: #020817 !important; /* Updated background */
            color: #ffffff !important; /* Ensuring text contrast */
        }

        .modal-card, .dynamic-widget-card {
            border-radius: 0 !important;
            background: linear-gradient(to bottom, #020817, #020817) !important; /* Single tone gradient */
        }

        .social-redirect-view__container, .wallet-no-access__container, .pending-signature__container, .pending-connect__container {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin-top: -15%;
            background-color: #020817 !important; /* Updated background */
            color: #ffffff !important; /* Ensuring text contrast */
        }

        .footer-options-switcher__container {
            border-radius: 0 !important;
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            background-color: #020817 !important; /* Updated background */
        }

        .dynamic-user-profile-layout {
            height: 90vh !important;
            background-color: #020817 !important; /* Updated background */
            color: #ffffff !important; /* Ensuring text contrast */
        }

        .dynamic-footer, .tos-and-pp__footer {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            background-color: #020817 !important; /* Updated background */
            color: #ffffff !important; /* Ensuring text contrast */
        }

        .tos-and-pp__footer {
            bottom: 30px !important;
        }
    }
`;


export default function DynamicSolanaWalletProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const router = useRouter();

    return (
        <DynamicContextProvider
        settings={{
            environmentId: "2df7d89b-fc28-4a0c-a0da-3040c09dc0c9",
            walletConnectors: [SolanaWalletConnectors],
            cssOverrides: sidebarCss,
            events: {
                onLogout: (args) => {
                    console.log("Logged out", args);
                    router.push("/");
                },
                onAuthSuccess: (args) => {
                    console.log("Auth success", args);
                    router.push("/create");
                }
            }
        }}
        >
        {children}
        </DynamicContextProvider>
    );
} 