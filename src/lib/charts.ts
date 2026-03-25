import { 
    Chart, 
    registerables, 
} from 'chart.js';
import type { ChartConfiguration } from 'chart.js';


Chart.register(...registerables);

/**
 * Renders a Chart.js configuration to a PNG DataURL using an off-screen canvas.
 */
export const renderChartToImage = (config: any): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
        }

        // Deep copy and disable animations for instant rendering
        const finalConfig: ChartConfiguration = {
            ...config,
            plugins: [
                ...(config.plugins || []),
                {
                    id: 'custom_canvas_background_color',
                    beforeDraw: (chart: any) => {
                        const {ctx} = chart;
                        ctx.save();
                        ctx.globalCompositeOperation = 'destination-over';
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, chart.width, chart.height);
                        ctx.restore();
                    }
                }
            ],
            options: {
                ...config.options,
                animation: false as any,
                responsive: false,
                devicePixelRatio: 2, // High DPI for crisp PPTX images
                layout: {
                    padding: 50 // Global padding to prevent clipping at edges
                },
                plugins: {
                    ...config.options?.plugins,
                    legend: {
                        display: true,
                        labels: {
                            font: { size: 16, weight: 'bold' },
                            color: '#333'
                        }
                    }
                }
            }
        } as any;

        try {
            const chart = new Chart(ctx, finalConfig);
            const dataUrl = canvas.toDataURL('image/png');
            chart.destroy();
            resolve(dataUrl);
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Specialized generator for Roadmap / Timeline charts
 */
export const createRoadmapConfig = (milestones: { label: string, date: string }[]): ChartConfiguration => {
    return {
        type: 'bar',
        data: {
            labels: milestones.map(m => m.label),
            datasets: [{
                label: 'Project Milestone Timeline',
                data: milestones.map((_, i) => i + 1), // Simple visual progression
                backgroundColor: [
                    'rgba(79, 70, 229, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                ],
                borderRadius: 10,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal for Roadmap
            scales: {
                x: { display: false },
                y: { 
                    ticks: { font: { size: 18, weight: 'bold' }, color: '#1e293b' },
                    grid: { display: false }
                }
            }
        }
    } as any;
};
