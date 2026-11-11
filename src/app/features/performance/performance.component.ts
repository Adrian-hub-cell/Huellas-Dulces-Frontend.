import { DecimalPipe } from '@angular/common';
import {
  Component,
  OnDestroy,
  signal
} from '@angular/core';

interface PerformanceMetric {
  id: string;
  name: string;
  type: string;
  ttfb: number;
  measuredAt: string;
}

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <main class="performance-page">
      <header class="page-header">
        <div>
          <span class="eyebrow">HUELLAS DULCES · MONITOREO</span>
          <h1>Rendimiento de la aplicación</h1>
          <p>Supervisa los tiempos de respuesta de tu tienda.</p>
        </div>

        <button class="refresh-button" (click)="refreshMetrics()">
          ↻ Actualizar mediciones
        </button>
      </header>

      <section class="summary-card">
        <div>
          <span class="summary-label">TTFB de navegación</span>
          <div class="main-value">
            @if (navigationTtfb() !== null) {
              {{ navigationTtfb() | number:'1.0-2' }} ms
            } @else {
              Sin medición
            }
          </div>
          <span class="summary-description">
            Tiempo hasta recibir el primer byte del servidor
          </span>
        </div>

        <div class="status" [class.good]="(navigationTtfb() ?? 0) < 800">
          {{ navigationTtfb() === null ? 'Esperando datos' :
             (navigationTtfb() ?? 0) < 800 ? 'Respuesta adecuada' : 'Respuesta lenta' }}
        </div>
      </section>

      <section class="metrics-section">
        <div class="section-heading">
          <div>
            <h2>Mediciones registradas</h2>
            <p>Datos capturados mediante PerformanceObserver.</p>
          </div>
          <span class="counter">{{ metrics().length }} registros</span>
        </div>

        @if (metrics().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">📊</span>
            <h3>Esperando mediciones</h3>
            <p>Navega por la aplicación para registrar nuevas solicitudes.</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Recurso</th>
                  <th>Tipo</th>
                  <th>TTFB</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                @for (metric of metrics(); track metric.id) {
                  <tr>
                    <td class="resource-name">{{ metric.name }}</td>
                    <td>{{ metric.type }}</td>
                    <td class="metric-value">{{ metric.ttfb | number:'1.0-2' }} ms</td>
                    <td>{{ metric.measuredAt }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>

      <footer class="information">
        <strong>¿Qué es el TTFB?</strong>
        <p>
          Es el tiempo transcurrido entre el inicio de una solicitud
          y la recepción del primer byte de respuesta. Un valor menor
          generalmente indica una respuesta más rápida.
        </p>
      </footer>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100%;
      color: #302b2b;
    }

    .performance-page {
      max-width: 1180px;
      margin: 0 auto;
      padding: 36px 24px 60px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 30px;
    }

    .eyebrow {
      color: #a45e72;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.5px;
    }

    h1 {
      margin: 9px 0;
      font-size: clamp(25px, 4vw, 36px);
    }

    .page-header p,
    .section-heading p {
      color: #777;
      margin: 0;
    }

    .refresh-button {
      border: 0;
      border-radius: 12px;
      background: #9d536b;
      color: white;
      padding: 13px 19px;
      font-weight: 700;
      cursor: pointer;
    }

    .refresh-button:hover {
      background: #814157;
    }

    .summary-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
      padding: 28px;
      border-radius: 20px;
      background: #fff4f6;
      border: 1px solid #f0dce2;
      margin-bottom: 32px;
    }

    .summary-label {
      color: #875365;
      font-weight: 700;
    }

    .main-value {
      font-size: 42px;
      font-weight: 800;
      margin: 10px 0;
    }

    .summary-description {
      color: #777;
      font-size: 14px;
    }

    .status {
      padding: 10px 15px;
      border-radius: 30px;
      background: #eee8e8;
      color: #655;
      font-size: 13px;
      font-weight: 700;
    }

    .status.good {
      background: #e1f3e8;
      color: #276342;
    }

    .metrics-section {
      margin-bottom: 30px;
    }

    .section-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }

    h2 {
      font-size: 21px;
      margin: 0 0 7px;
    }

    .counter {
      background: #f5eeee;
      padding: 8px 13px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
    }

    .table-wrapper {
      overflow-x: auto;
      border: 1px solid #eee5e7;
      border-radius: 15px;
      background: white;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      min-width: 620px;
    }

    th, td {
      padding: 15px 17px;
      border-bottom: 1px solid #f0ebec;
      font-size: 14px;
    }

    th {
      background: #faf6f7;
      color: #795565;
    }

    tbody tr:last-child td {
      border-bottom: 0;
    }

    .resource-name {
      max-width: 300px;
      overflow-wrap: anywhere;
    }

    .metric-value {
      font-weight: 800;
      white-space: nowrap;
    }

    .empty-state {
      padding: 45px 20px;
      text-align: center;
      border: 1px dashed #dfcbd1;
      border-radius: 16px;
      background: #fffafb;
    }

    .empty-icon {
      font-size: 35px;
    }

    .empty-state p {
      color: #777;
    }

    .information {
      padding: 20px;
      background: #f8f5f3;
      border-radius: 14px;
      line-height: 1.6;
    }

    .information p {
      margin-bottom: 0;
      color: #686060;
    }

    @media (max-width: 600px) {
      .performance-page {
        padding: 24px 15px 40px;
      }

      .summary-card {
        padding: 20px;
      }

      .main-value {
        font-size: 34px;
      }
    }
  `]
})
export class PerformanceComponent implements OnDestroy {
  readonly metrics = signal<PerformanceMetric[]>([]);
  readonly navigationTtfb = signal<number | null>(null);

  private observer?: PerformanceObserver;
  private metricCounter = 0;

  constructor() {
    this.refreshMetrics();

    if (
      typeof window !== 'undefined' &&
      'PerformanceObserver' in window
    ) {
      this.observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.registerResource(entry as PerformanceResourceTiming);
          }
        }
      });

      try {
        this.observer.observe({
          type: 'resource',
          buffered: true
        });
      } catch {
        this.observer = undefined;
      }
    }
  }

  refreshMetrics(): void {
    if (typeof performance === 'undefined') {
      return;
    }

    this.metrics.set([]);
    this.metricCounter = 0;

    const navigationEntry = performance.getEntriesByType('navigation')[0];
    const navigation = navigationEntry as PerformanceNavigationTiming | undefined;

    if (navigation && navigation.responseStart > 0) {
      const ttfb = navigation.responseStart - navigation.requestStart;

      this.navigationTtfb.set(ttfb);

      this.addMetric({
        name: 'Navegación principal',
        type: 'navigation',
        ttfb
      });
    }

    const resources = performance.getEntriesByType('resource')
      .filter((entry): entry is PerformanceResourceTiming =>
        entry.entryType === 'resource'
      );

    for (const resource of resources) {
      this.registerResource(resource);
    }
  }

  private registerResource(entry: PerformanceResourceTiming): void {
    if (!entry.responseStart || !entry.requestStart) {
      return;
    }

    const ttfb = entry.responseStart - entry.requestStart;

    let resourceName = entry.name;

    try {
      resourceName = new URL(entry.name).pathname;
    } catch {
      // Conserva el nombre original si no es una URL válida.
    }

    this.addMetric({
      name: resourceName,
      type: entry.initiatorType || 'resource',
      ttfb
    });
  }

  private addMetric(data: {
    name: string;
    type: string;
    ttfb: number;
  }): void {
    const metric: PerformanceMetric = {
      id: `${Date.now()}-${this.metricCounter++}`,
      name: data.name,
      type: data.type,
      ttfb: data.ttfb,
      measuredAt: new Date().toLocaleTimeString()
    };

    this.metrics.update(current => [
      metric,
      ...current
    ].slice(0, 100));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
