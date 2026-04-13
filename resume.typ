// Prithvish Baidya Resume
#set page(
  paper: "us-letter",
  margin: (x: 0.5in, y: 0.45in),
)

#set text(
  font: "New Computer Modern",
  size: 9.5pt,
)

#set par(justify: true, leading: 0.52em)

// Style all links: blue + underline
#show link: it => underline(text(fill: rgb("#1d4ed8"), it))

#let section(title) = {
  v(6pt)
  text(weight: "bold", size: 10.5pt)[#upper(title)]
  v(-3pt)
  line(length: 100%, stroke: 0.5pt)
  v(1pt)
}

#let entry(title, subtitle: none, location: none, date: none, body) = {
  block(breakable: false)[
    #grid(
      columns: (1fr, auto),
      align: (left, right),
      {
        text(weight: "bold")[#title]
        if subtitle != none [ | #subtitle]
      },
      if date != none [#text(style: "italic")[#date]]
    )
    #if location != none {
      text(size: 8.5pt, style: "italic")[#location]
    }
    #v(1pt)
    #body
    #v(3pt)
  ]
}

// Header
#align(center)[
  #text(size: 18pt, weight: "bold")[Prithvish Baidya]
  #v(2pt)
  #text(size: 9pt)[
    #link("mailto:mail@d4mr.com")[mail\@d4mr.com] #h(8pt)
    #link("https://github.com/d4mr")[GitHub] #h(8pt)
    #link("https://linkedin.com/in/prithvish-baidya")[LinkedIn] #h(8pt)
    #link("https://x.com/earth_ish")[\@earth_ish] #h(8pt)
    #link("https://d4mr.com")[d4mr.com]
  ]
  #v(1pt)
  #text(size: 8.5pt, fill: rgb("#666"))[India · Remote-first · Comfortable with US (PT), EU (CET), or async timezones]
]

#v(2pt)

Systems engineer, currently on the Rollups Team at #link("https://conduit.xyz")[Conduit]. Co-authored #link("https://eips.ethereum.org/EIPS/eip-7518")[ERC-7518]. Built the transaction backend powering #link("https://www.linkedin.com/posts/third-web_american-express-launched-amex-passport-activity-7373754069758201856-2yeu/")[American Express's NFT program]. Won #link("https://devfolio.co/projects/zkrail-5702")[ETHIndia 2024] (2,500+ hackers, 36 hours). 4 years shipping production systems: transaction infrastructure, cryptography, and protocol tooling.

#section("Experience")

#entry(
  link("https://conduit.xyz")[Conduit],
  subtitle: "Software Engineer — Rollups Team",
  location: "Remote",
  date: "Apr 2026 – Present"
)[
  - Working on rollup infrastructure.
]

#entry(
  link("https://thirdweb.com")[thirdweb],
  subtitle: "Software Engineer",
  location: "Remote",
  date: "Jul 2024 – Nov 2025"
)[
  - Built #link("https://github.com/thirdweb-dev/engine-core")[engine-core]: Rust transaction backend powering thirdweb's API. 100k+ daily transactions across 2,000+ chains. Nonce management is the hard part, and this makes "mint 10,000 NFTs in one call" actually work.
  - Powers #link("https://www.linkedin.com/posts/third-web_american-express-launched-amex-passport-activity-7373754069758201856-2yeu/")[Amex Passport], issuing digital collectibles to 140M+ cardholders. Zero failed transactions in production.
  - Built #link("https://github.com/thirdweb-dev/engine-core/tree/main/twmq")[twmq]: Redis-backed job queue with exactly-once delivery, sub-100ms p99 latency. Handles crash recovery and retries for engine-core.
  - Designed *Vault*: non-custodial key management using AWS Nitro Enclaves. Keys live in a TEE with cryptographic attestation. Enterprise custody without the custody risk.
]

#entry(
  link("https://zoniqx.com")[Zoniqx],
  subtitle: "Lead Architect",
  location: "Remote",
  date: "Jul 2022 – Jun 2024"
)[
  - Led team of 4 engineers. Co-authored #link("https://eips.ethereum.org/EIPS/eip-7518")[ERC-7518]: Ethereum standard for compliant real-world asset tokenization. Introduces partition-based semi-fungible tokens with dynamic transfer restrictions.
  - Built the first compliant RWA tokenization layer on XRPL.
  - Architected enterprise platforms: *Heimdall* (web3 operational layer) and *CompliTO* (compliant security token transfers).
]

#entry(
  link("https://biconomy.io")[Biconomy],
  subtitle: "Software Engineer",
  location: "Remote",
  date: "Nov 2021 – May 2022"
)[
  - Rebuilt gasless transaction infrastructure processing 2M+ meta-transactions/month. Enterprise clients included JP Morgan.
  - Built the first multichain *ERC-4337* smart contract wallet (hackathon POC → production in 3 months).
]

#entry(
  "Libertas Network",
  subtitle: "Senior Fullstack Developer",
  location: "Remote",
  date: "Mar 2021 – Nov 2021"
)[
  - Built decentralized censorship-resistant podcasting platform using IPFS, Node.js, and Ethereum. (Company shut down)
]

#section("Projects")

#entry(
  link("https://github.com/d4mr/zkrail")[zkRail],
  subtitle: [#link("https://devfolio.co/projects/zkrail-5702")[ETHIndia 2024 Winner] | #link("https://www.youtube.com/watch?v=cga5izmuuQE")[Demo Video]],
  date: "Dec 2024"
)[
  Trustless fiat settlement using ZK proofs over banking APIs. Solver network executes real payments; 150% collateral + game-theoretic bonds prevent fraud. Won 1st place overall (2,500+ hackers, \$50k+ prize pool) plus 4 track bounties. Built in 36 hours solo. #link("https://d4mr.com/posts/zkrail-trustless-fiat/")[Technical writeup].
]

#entry(
  link("https://github.com/d4mr/t2z")[t2z],
  subtitle: [1st Place ECC Track, Zypherpunk 2025 (\$9k total)],
  date: "2025"
)[
  Rust library for Zcash shielded transactions. Compiles Halo 2 ZK proving to 3.7MB WASM (no 50MB parameter downloads). Implements ZIP-374 PCZT with external signer support for hardware wallets. Cross-platform via UniFFI.
]

#entry(
  link("https://github.com/d4mr/coredrain")[Coredrain],
  date: "2025"
)[
  Indexer for Hyperliquid's exotic architecture (HyperCore L1 to HyperEVM). Correlates L1 transfers with EVM transaction hashes. Discovered #link("https://d4mr.com/posts/hyperevm-phantom-hash/")[undocumented dual-hash convention] for system transactions by reverse-engineering nanoreth source. Lazy indexing with block interpolation search.
]

#block(breakable: false)[
  #section("Publications & Open Source")

  #link("https://eips.ethereum.org/EIPS/eip-7518")[*ERC-7518: Dynamic Compliant Interop Security Token*], Co-author #h(1fr) _Review, Ethereum EIPs_

  #v(4pt)

  #link("https://github.com/thirdweb-dev/engine-core")[*engine-core*]: Production Rust transaction infrastructure for blockchain. Primary author. #h(1fr) _2024–2025_

  #v(4pt)

  #link("https://github.com/oven-sh/bun/pull/25514")[*Bun*, PR \#25514]: Added S3 Requester Pays support to Bun's native S3 client. Zig, TypeScript. #h(1fr) _2025_
]

#block(breakable: false)[
  #section("Stack")

  *Languages* / Rust, Go, TypeScript, Solidity

  *Infrastructure* / PostgreSQL, Redis, Kafka, AWS Nitro Enclaves, Cloudflare (Workers, D1, R2, Durable Objects, Queues)

  *Cryptography* / ZK (Halo 2, Noir), Zcash/Orchard, WASM

  *Frontend* / React, Next.js, Astro, Tanstack, Three.js
]

#block(breakable: false)[
  #section("Recognition")

  #link("https://devfolio.co/projects/zkrail-5702")[*ETHIndia 2024*]: 1st place overall (2,500+ hackers) plus Polygon, Coinbase, CDP, Base bounties #h(1fr) _Dec 2024_

  #v(3pt)

  #link("https://zypherpunk.d4mr.com/project/tz-2bf2/")[*Zypherpunk 2025*]: 1st place ECC track (\$5k), plus Tachyon, Raybot, Network School bounties (\$9k total) #h(1fr) _2025_

  #v(3pt)

  *KVPY-SA Fellowship*: National science fellowship by Indian Institute of Science. Top 1% of 100,000+ applicants selected for research mentorship. #h(1fr) _2019_

  #v(3pt)

  *NTSE Scholar*: National Talent Search Examination. Nationwide exam selecting top 1,000 students from 1.5M+ for merit scholarship. #h(1fr) _2019_
]

