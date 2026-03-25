import { notFound } from "next/navigation";
import { views } from "@/data/views";
import Content from "./content";

export const dynamicParams = false;

export function generateStaticParams() {
    return views.map((v) => ({ slug: v.slug }));
}

export default async function ViewPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const config = views.find((v) => v.slug === slug);

    if (!config) return notFound();

    return <Content config={config} />;
}