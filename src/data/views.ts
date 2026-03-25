export interface ViewEndpoint {
    name: string;
    url: string;
}

export interface ViewConfig {
    slug: string;
    title: string;
    endpoints: ViewEndpoint[];
    interval?: number;
}

export const views: ViewConfig[] = [
    {
        slug: "demo",
        title: "Demo",
        endpoints: [{ name: "API Logs", url: "https://api.sylvain.sh/logs" }],
    },
];