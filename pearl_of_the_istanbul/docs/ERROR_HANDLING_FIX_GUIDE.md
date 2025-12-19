# 🚨 Error Handling ve Edge Cases Çözüm Rehberi

**Proje:** Pearl of the Istanbul  
**Tarih:** 6 Kasım 2025  
**Kapsam:** Kapsamlı error handling sistemi

---

## 📋 İçindekiler

1. [Global Error Boundary](#1-global-error-boundary)
2. [Async Error Handling](#2-async-error-handling)
3. [User-Friendly Error Messages](#3-user-friendly-error-messages)
4. [Error Logging & Monitoring](#4-error-logging--monitoring)
5. [Edge Case Handling](#5-edge-case-handling)

---

## 1. Global Error Boundary

### React Error Boundary

**Dosya:** `src/components/ErrorBoundary.tsx`

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    // Log to error monitoring service
    if (window.errorReporter) {
      window.errorReporter.logError(error, {
        componentStack: errorInfo.componentStack,
      });
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <div className="error-boundary-fallback">
          <h1>Bir şeyler yanlış gitti</h1>
          <p>{this.state.error.message}</p>
          <button onClick={this.reset}>Tekrar Dene</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 2. Async Error Handling

### Try-Catch Wrapper

**Dosya:** `src/utils/errorUtils.ts`

```typescript
import { Result, ok, err } from '@/types/api.types';

/**
 * Safe async function wrapper
 */
export const tryCatch = async <T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<Result<T>> => {
  try {
    const result = await fn();
    return ok(result);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(errorMessage || 'Async operation failed:', err);
    return err(err);
  }
};

/**
 * Retry logic
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
  } = {}
): Promise<T> => {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('Retry failed');
};
```

### Fetch Wrapper

**Dosya:** `src/utils/fetchWrapper.ts`

```typescript
export class FetchError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `HTTP Error ${status}: ${statusText}`);
    this.name = 'FetchError';
  }
}

export const fetchJSON = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new FetchError(
        response.status,
        response.statusText,
        `Failed to fetch ${url}`
      );
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    
    throw new Error('Unknown fetch error');
  }
};
```

---

## 3. User-Friendly Error Messages

### Error Message Mapping

**Dosya:** `src/config/errorMessages.ts`

```typescript
export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  LOCATION_PERMISSION_DENIED = 'LOCATION_PERMISSION_DENIED',
  LOCATION_UNAVAILABLE = 'LOCATION_UNAVAILABLE',
  LOCATION_TIMEOUT = 'LOCATION_TIMEOUT',
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  INVALID_COORDINATES = 'INVALID_COORDINATES',
  POI_LOAD_FAILED = 'POI_LOAD_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const ERROR_MESSAGES = {
  tr: {
    [ErrorCode.NETWORK_ERROR]: {
      title: 'Bağlantı Hatası',
      message: 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
      action: 'Tekrar Dene',
    },
    [ErrorCode.LOCATION_PERMISSION_DENIED]: {
      title: 'Konum İzni Reddedildi',
      message: 'Konumunuzu kullanabilmemiz için tarayıcı ayarlarından izin vermeniz gerekiyor.',
      action: 'Ayarları Aç',
    },
    [ErrorCode.LOCATION_UNAVAILABLE]: {
      title: 'Konum Bulunamadı',
      message: 'Konumunuz şu anda tespit edilemiyor. GPS\'inizin açık olduğundan emin olun.',
      action: 'Tamam',
    },
    [ErrorCode.LOCATION_TIMEOUT]: {
      title: 'Zaman Aşımı',
      message: 'Konum bilgisi alınırken zaman aşımına uğradı. Lütfen tekrar deneyin.',
      action: 'Tekrar Dene',
    },
    [ErrorCode.ROUTE_NOT_FOUND]: {
      title: 'Rota Bulunamadı',
      message: 'Bu konuma giden bir rota bulunamadı. Farklı bir nokta deneyin.',
      action: 'Tamam',
    },
  },
  en: {
    [ErrorCode.NETWORK_ERROR]: {
      title: 'Connection Error',
      message: 'Please check your internet connection and try again.',
      action: 'Retry',
    },
    // ... other languages
  },
} as const;

export const getErrorMessage = (
  code: ErrorCode,
  language: 'tr' | 'en' = 'tr'
) => {
  return ERROR_MESSAGES[language][code] || ERROR_MESSAGES[language][ErrorCode.UNKNOWN_ERROR];
};
```

### Toast Notification System

**Dosya:** `src/components/Toast/ToastContext.tsx`

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    const duration = toast.duration || 3000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
```

---

## 4. Error Logging & Monitoring

### Error Reporter

**Dosya:** `src/services/errorReporter.ts`

```typescript
interface ErrorReport {
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: number;
  userAgent: string;
  url: string;
}

class ErrorReporter {
  private queue: ErrorReport[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    // Online/offline listeners
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  logError(error: Error, context?: Record<string, unknown>): void {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('[ErrorReporter]', report);

    if (this.isOnline) {
      this.sendReport(report);
    } else {
      this.queue.push(report);
    }
  }

  private async sendReport(report: ErrorReport): Promise<void> {
    try {
      // Send to error monitoring service (e.g., Sentry, LogRocket)
      if (import.meta.env.PROD) {
        await fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
        });
      }
    } catch (error) {
      // Failed to send, add back to queue
      this.queue.push(report);
    }
  }

  private async flushQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const report = this.queue.shift();
      if (report) {
        await this.sendReport(report);
      }
    }
  }
}

export const errorReporter = new ErrorReporter();

// Global error handlers
window.addEventListener('error', (event) => {
  errorReporter.logError(event.error, {
    type: 'uncaught',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorReporter.logError(
    new Error(event.reason),
    { type: 'unhandled-rejection' }
  );
});
```

---

## 5. Edge Case Handling

### Geolocation Edge Cases

**Dosya:** `src/utils/geolocationUtils.ts`

```typescript
import { Coordinate } from '@/types/core.types';
import { APP_CONFIG } from '@/config/app.config';

export enum GeolocationErrorType {
  PERMISSION_DENIED = 1,
  POSITION_UNAVAILABLE = 2,
  TIMEOUT = 3,
}

export class GeolocationError extends Error {
  constructor(
    public code: GeolocationErrorType,
    message: string
  ) {
    super(message);
    this.name = 'GeolocationError';
  }
}

export const getCurrentPosition = (): Promise<Coordinate> => {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new GeolocationError(
        GeolocationErrorType.POSITION_UNAVAILABLE,
        'Geolocation not supported'
      ));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([position.coords.longitude, position.coords.latitude]);
      },
      (error) => {
        reject(new GeolocationError(
          error.code as GeolocationErrorType,
          getGeolocationErrorMessage(error.code)
        ));
      },
      {
        enableHighAccuracy: APP_CONFIG.navigation.ENABLE_HIGH_ACCURACY,
        timeout: APP_CONFIG.navigation.LOCATION_TIMEOUT_MS,
        maximumAge: APP_CONFIG.navigation.LOCATION_MAX_AGE_MS,
      }
    );
  });
};

const getGeolocationErrorMessage = (code: number): string => {
  switch (code) {
    case GeolocationErrorType.PERMISSION_DENIED:
      return 'Konum izni reddedildi';
    case GeolocationErrorType.POSITION_UNAVAILABLE:
      return 'Konum bilgisi alınamıyor';
    case GeolocationErrorType.TIMEOUT:
      return 'Konum alınırken zaman aşımı';
    default:
      return 'Bilinmeyen konum hatası';
  }
};
```

### API Error Handling

**Dosya:** `src/hooks/usePOIData.ts`

```typescript
import { useState, useEffect } from 'react';
import { POI } from '@/types/poi.types';
import { AsyncState } from '@/types/async.types';
import { fetchJSON, FetchError } from '@/utils/fetchWrapper';
import { useToast } from '@/components/Toast/ToastContext';

export const usePOIData = (category: string) => {
  const [state, setState] = useState<AsyncState<POI[]>>({ status: 'idle' });
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;

    const loadPOIs = async () => {
      setState({ status: 'loading' });

      try {
        const data = await fetchJSON<{ features: any[] }>(
          `/data/${category}.geojson`
        );

        if (!mounted) return;

        const pois = data.features.map(/* transform */);
        setState({ status: 'success', data: pois });
      } catch (error) {
        if (!mounted) return;

        const errorMessage = error instanceof FetchError
          ? `HTTP ${error.status}: ${error.statusText}`
          : 'Beklenmeyen hata';

        setState({ 
          status: 'error', 
          error: error instanceof Error ? error : new Error(errorMessage)
        });

        showToast({
          type: 'error',
          title: 'Veri Yüklenemedi',
          message: `${category} kategorisi yüklenemedi: ${errorMessage}`,
        });
      }
    };

    loadPOIs();

    return () => {
      mounted = false;
    };
  }, [category, showToast]);

  return state;
};
```

---

## 📊 Checklist

- [ ] Error Boundary ekle
- [ ] Tüm async işlemlere try-catch ekle
- [ ] User-friendly error messages
- [ ] Toast notification sistemi
- [ ] Error logging/monitoring
- [ ] Geolocation error handling
- [ ] Network error handling
- [ ] Loading states
- [ ] Retry logic
- [ ] Offline support

---

**Hazırlayan:** AI Code Analyzer  
**Tarih:** 6 Kasım 2025
