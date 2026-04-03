"use client"
import React, { useRef, useState,useEffect } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';

import Styles from './imageSide.module.css'

// import './styles.css';

// import required modules
import { Pagination, Autoplay } from 'swiper/modules';

export default function ImageSlide({ images, title }) {
     const [carouselItems, setCarouselItems] = useState([])
     const baseLabel = (title || "Community media").replace(/<[^>]*>/g, "").trim() || "Community media"

     // Helper function to convert API paths to absolute URLs
     const toAbsoluteImageUrl = (path) => {
       if (!path) return null
       // If already a full URL, return as is
       if (typeof path === 'string' && path.startsWith('http')) return path
       
       // Get base URL from environment and ensure no trailing slash
       const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || '').replace(/\/+$/, '')
       
       // Remove leading slashes and public/ prefix from path
       const cleanPath = path.replace(/^\/+/, '').replace(/^public\//, '')
       
       // Construct full URL: baseUrl/admin/uploads/filename
       return `${baseUrl}/admin/${cleanPath}`
     }

    const normalizeImages = (input) => {
      if (!input) return []
      let raw = input
      try {
        if (typeof input === 'string') {
          raw = JSON.parse(input)
        }
      } catch (_e) {
        // if it's a single string url
        if (typeof input === 'string') {
          const url = input
          const inferredType = /\.mp4|\.webm|\.ogg$/i.test(url) ? 'video' : 'image'
          const absUrl = (!url.startsWith('http') && !url.startsWith('/assets')) ? toAbsoluteImageUrl(url) : url
          return [{ url: absUrl, type: inferredType }]
        }
        return []
      }

      if (Array.isArray(raw)) {
        return raw
          .map((item) => {
            const urlRaw = typeof item === 'string' ? item : (item?.url || item?.path)
            if (!urlRaw) return null
            const typeRaw = typeof item === 'string' ? undefined : item?.type
            const absUrl = (!urlRaw.startsWith('http') && !urlRaw.startsWith('/assets')) ? toAbsoluteImageUrl(urlRaw) : urlRaw
            const inferredType = typeRaw || (/\.mp4|\.webm|\.ogg$/i.test(absUrl) ? 'video' : 'image')
            return { url: absUrl, type: inferredType }
          })
          .filter((m) => m && typeof m.url === 'string' && m.url.length > 0)
      }

      return []
    }

    useEffect(() => {
       setCarouselItems(normalizeImages(images))
    }, [images])

  return (
    <>
      <Swiper
        pagination={{ clickable: true, dynamicBullets: true }}
        // autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        modules={[Pagination, Autoplay]}
        className="mySwiper"
      >
        {carouselItems?.length > 0 && carouselItems.map((media, index) => {
          const slideLabel = `${baseLabel} - media ${index + 1}`
          return (
          <SwiperSlide key={index}>
            <div className={Styles.CarouselimageContainer}>
              {media.type === 'video' ? (
                <video
                  src={media.url}
                  className={Styles.Carouselimage}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={slideLabel}
                />
              ) : (
                <img
                  src={media.url}
                  alt={slideLabel}
                  title={slideLabel}
                  className={Styles.sliderImg}
                />
              )}
            </div>
          </SwiperSlide>
        )})}
     
      </Swiper>
    </>
  );
}
