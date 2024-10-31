import dynamic from "next/dynamic";

const ImageGallery = dynamic(() => import("../../components/swiper"), {
  ssr: false,
});

export default function Home() {
  return (
    <div>
      <ImageGallery />
    </div>
  );
}
