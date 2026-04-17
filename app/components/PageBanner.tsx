import Image from "next/image";

export default function PageBanner() {
    return (
        <section className="relative w-full">
            <Image
                src="/assets/bannerspmb.png"
                alt="SPMB BPK PENABUR Bandung"
                width={1600}
                height={500}
                priority
                className="w-full h-auto object-cover"
            />
        </section>
    );
}
