import dynamic from "next/dynamic";

const ImageGallery = dynamic(() => import("../components/swiper/index"), {
  ssr: false,
});

export default function Home() {
  return (
    <div>
      <ImageGallery />
    </div>
  );
}
