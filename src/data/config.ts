import type { ViewOptions } from "@/data/views";

interface FlowersConfig {
    standalone: boolean;
    view: ViewOptions;
}

export const config: FlowersConfig = {
    standalone: false, // Set to true to use as the main app
    view: {
        title: "Dashboard",
        // Add multiple endpoints to get a selector in the header
        endpoints: [
            { name: "API Logs", url: "https://api.example.com/logs" },
            { name: "API Version", url: "https://api.example.com/latest" },
        ],
        // interval: 5000
    },
};