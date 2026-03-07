"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

export default function ImageSlider() {
  const images = [
    "/images/slide1.png",
    "/images/slide2.png",
    "/images/slide3.png",
    "/images/slide4.png",
    "/images/slide5.png",
  ];

  return (
    <div className="w-full rounded-2xl overflow-hidden relative">
      <Swiper
        modules={[Autoplay, Navigation, EffectFade]}
        slidesPerView={1}
        loop={true}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 3000 }}
        navigation={false}
      >
        {images.map((src, index) => (
          <SwiperSlide key={index}>
            <img
              src={src}
              className="w-full h-15 md:h-52 lg:h-[20vh] object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
