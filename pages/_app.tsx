import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Optimism } from "@thirdweb-dev/chains"; // Importa la cadena Optimism
import "../styles/globals.css";

// Configura la cadena activa como Optimism Mainnet
const activeChain = Optimism;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      activeChain={activeChain}
    >
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;