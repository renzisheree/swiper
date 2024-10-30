import dynamic from "next/dynamic";

const TwoRowSwiper = dynamic(() => import("../../components/new-swiper"), {
  ssr: false,
});

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <TwoRowSwiper />
    </div>
  );
}
