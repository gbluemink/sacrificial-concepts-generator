// pages/_app.js
import '../styles/globals.css'
import Script from 'next/script'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script
        src="https://cdn.tailwindcss.com"
        strategy="beforeInteractive"
      />
      <Component {...pageProps} />
    </>
  )
}