"use client"
import React from 'react'
import styles from './NetworkGlobal.module.css'
import { useRouter } from 'next/navigation'

export default function NetworkGlobal() {
  const router = useRouter();
  
  return (
    <>
      {/* <div className={styles.extraspace}></div> */}
      <section className={styles.networkglobalsection}>
        <div className='container'>
          <div className={styles.networkglobalcontent}>
            <h2>Connect with a Network of Trusted Investors</h2>
            <p>Join our community to access verified investors, funding opportunities, and peer insights.</p>

            <button className={styles.cta} onClick={() => { router.push("/community") }}>
              Join Our COMMUNITY
              <span className={styles.arrow}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4.7915V15.2082" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15.2082 10H4.7915" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </div>

        </div>
        <div className={styles.networkglobalimage}>
          <img src="/earthimg.png" alt="Network Global" />
        </div>
        <div className={`${styles.networkglobalimage} ${styles.networkglobalimagemob}`}>
          <img src="/earthimgmob.png" alt="Network Global" />
        </div>
      </section>
    </>

  )
}   