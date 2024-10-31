import dynamic from "next/dynamic";

const ImageGallery = dynamic(() => import("../../components/new-swiper"), {
  ssr: false,
});

export default function Home() {
  return (
    <div>
      <ImageGallery />
    </div>
  );
}
