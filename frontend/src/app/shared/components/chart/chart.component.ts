import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartType, registerables } from 'chart.js';
import { ChartDataSeries } from '../../../core/services/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full min-h-[220px] flex items-center justify-center">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() type: ChartType = 'doughnut';
  @Input() dataSeries: ChartDataSeries | null = null;
  @Input() title: string = '';
  @Input() showLegend: boolean = true;

  private chartInstance: Chart | null = null;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['dataSeries'] || changes['type']) && this.canvasRef) {
      this.renderChart();
    }
  }

  private renderChart(): void {
    if (!this.canvasRef || !this.dataSeries) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartInstance = new Chart(ctx, {
      type: this.type,
      data: {
        labels: this.dataSeries.labels,
        datasets: this.dataSeries.datasets as any
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: this.showLegend,
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 15,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 11
              }
            }
          },
          tooltip: {
            backgroundColor: '#0f1b56',
            titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 'bold' },
            bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: this.type === 'doughnut' || this.type === 'pie' || this.type === 'radar' ? undefined : {
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 } }
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 } }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }
}
