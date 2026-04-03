import React from 'react'
import PreqtAppSection from '../landing-page/preqtAppsection/page'
import Faq from '../landing-page/components/Faq'
import styles from "./page.module.css"
import BannerSection from './BannerSection'
import PartnerWithUs from './PartnerWithUs'

const page = () => {
    return (
        <div style={{ background: '#111' }}>
            <BannerSection />

            <PartnerWithUs />

            <div className={styles.faqSections}>
                <h2>Frequently Asked <br /> Questions</h2>
                <p style={{ margin: 'auto 20px' }}>Everything you need to know about our partner program.</p>
                <Faq forPartner={true} />
            </div>


            <PreqtAppSection forPartner={true} />
        </div>
    )
}

export default page
