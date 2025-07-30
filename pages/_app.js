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


/*
import '../styles/globals.css'
import Head from 'next/head'
import React from 'react'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Tailwind Play CDN: injects Tailwind utilities at runtime }
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
*/