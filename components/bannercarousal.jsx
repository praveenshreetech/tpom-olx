"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useEffect, useState } from "react";

export default function BannerCarousel() {
  const [banners, setBanners] = useState([])

  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBanners(data);
        } else {
          console.error('Banners API did not return an array:', data);
          setBanners([]);
        }
      })
      .catch(err => {
        console.error('Banner load error:', err);
        setBanners([]);
      })
  }, [])

  if (banners.length === 0) return null

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        loop={banners.length > 1}
        className="swipper-div"
      >
        {banners.map(b => (
          <SwiperSlide key={b.id}>
            {b.link_url ? (
              <a href={b.link_url}>
                <img src={b.image_url} alt={b.title || ""} style={{ width: "100%", height: "300px", objectFit: "contain" }} />
              </a>
            ) : (
              <img src={b.image_url} alt={b.title || ""} style={{ width: "100%", height: "300px", objectFit: "contain" }} />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}