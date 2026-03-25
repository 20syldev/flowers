"use client";

import Link from "next/link";
import { useTranslations } from "@/i18n/provider";
import { useTheme } from "@/hooks/theme";

export default function PrivacyPage() {
    const t = useTranslations("privacy");
    const tf = useTranslations("landing");
    useTheme();

    const linkClass =
        "text-foreground underline underline-offset-2 hover:opacity-80 transition-opacity";

    const sections = [
        {
            title: t("dataCollected"),
            content: <p>{t("dataCollectedContent")}</p>,
        },
        {
            title: t("cookies"),
            content: <p>{t("cookiesContent")}</p>,
        },
        {
            title: t("thirdParty"),
            content: <p>{t("thirdPartyFonts")}</p>,
        },
        {
            title: t("analytics"),
            content: <p>{t("analyticsContent")}</p>,
        },
        {
            title: t("rights"),
            content: <p>{t("rightsContent")}</p>,
        },
        {
            title: t("contact"),
            content: (
                <p>
                    {t("contactContent").split("contact@sylvain.sh")[0]}
                    <a href="mailto:contact@sylvain.sh" className={linkClass}>
                        contact@sylvain.sh
                    </a>
                </p>
            ),
        },
    ];

    return (
        <div className="min-h-dvh flex flex-col animate-in fade-in duration-700">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                <div className="max-w-4xl mx-auto flex items-center justify-between px-6 h-14">
                    <Link
                        href="/"
                        className="text-lg font-semibold hover:opacity-80 transition-opacity"
                    >
                        Flowers
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {t("backHome")}
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 py-16 px-6">
                <div className="max-w-3xl mx-auto space-y-10">
                    <h1 className="text-3xl font-bold">{t("title")}</h1>

                    {sections.map((section) => (
                        <div key={section.title} className="space-y-2">
                            <h2 className="text-lg font-semibold">{section.title}</h2>
                            <div className="text-muted-foreground text-sm leading-relaxed space-y-1">
                                {section.content}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="border-t py-8 px-6">
                <div className="max-w-3xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
                    <div className="space-y-1">
                        <p>© 2026 flowers.sylvain.sh</p>
                        <div className="flex items-center gap-1.5 text-xs">
                            <Link href="/legal" className="hover:text-foreground transition-colors">
                                {tf("footer.legal")}
                            </Link>
                            <span>·</span>
                            <span>{tf("footer.privacy")}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}