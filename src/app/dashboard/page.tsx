'use client';

import { useState, useEffect } from 'react';
import TimeRangeSelector from '@/components/dashboard/TimeRangeSelector';
import LineChart from '@/components/dashboard/LineChart';
import GaugeMeter from '@/components/dashboard/GaugeMeter';
import StatusLED from '@/components/dashboard/StatusLED';

interface Device {
  device_id: string;
  thing_id: string;
  properties: Array<{
    id: string;
    name: string;
    unit: string | null;
    type: string;
  }>;
}

interface DataResponse {
  data: Array<{ timestamp: string; value: number; raw: string }>;
  current: { value: number; raw: string; timestamp: string } | null;
  property: { name: string; unit: string | null; type: string } | null;
}

interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export default function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [range, setRange] = useState<string>('1H');
  const [data, setData] = useState<DataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  // Cargar dispositivos
  useEffect(() => {
    fetch('/api/devices')
      .then(res => res.json())
      .then((result: ApiResult<{ devices: Device[] }>) => {
        if (result.success && result.data) {
          setDevices(result.data.devices || []);
          if (result.data.devices?.length > 0) {
            setSelectedDevice(result.data.devices[0].device_id);
            if (result.data.devices[0].properties?.length > 0) {
              setSelectedProperty(result.data.devices[0].properties[0].name);
            }
          }
          setError(null);
        } else {
          setError(result.error || 'Failed to load devices');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading devices:', err);
        setError('Network error: Failed to load devices');
        setLoading(false);
      });
  }, []);

  // Cargar datos con polling para LIVE
  useEffect(() => {
    if (!selectedDevice || !selectedProperty) return;

    const fetchData = () => {
      fetch(`/api/data?device_id=${selectedDevice}&property=${selectedProperty}&range=${range}`)
        .then(res => res.json())
        .then((result: ApiResult<DataResponse>) => {
          if (result.success && result.data) {
            setData(result.data);
            setDataError(null);
          } else {
            setDataError(result.error || 'Failed to load data');
            setData(null);
          }
        })
        .catch(err => {
          console.error('Error loading data:', err);
          setDataError('Network error: Failed to load data');
          setData(null);
        });
    };

    fetchData();

    if (range === 'LIVE') {
      const interval = setInterval(fetchData, 3000); // Polling cada 3 segundos
      return () => clearInterval(interval);
    }
  }, [selectedDevice, selectedProperty, range]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Devices</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No devices found</h2>
        <p className="text-gray-600">Start sending webhooks to see data here.</p>
      </div>
    );
  }

  const currentDevice = devices.find(d => d.device_id === selectedDevice);
  const currentProp = currentDevice?.properties.find(p => p.name === selectedProperty);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">IoT Dashboard</h1>

        {/* Selectores */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Device</label>
              <select
                value={selectedDevice}
                onChange={(e) => {
                  setSelectedDevice(e.target.value);
                  const device = devices.find(d => d.device_id === e.target.value);
                  const firstProp = device?.properties?.[0];
                  if (firstProp) {
                    setSelectedProperty(firstProp.name);
                  }
                }}
                className="w-full p-2 border rounded-md"
              >
                {devices.map(device => (
                  <option key={device.device_id} value={device.device_id}>
                    {device.device_id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Property</label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {currentDevice?.properties.map(prop => (
                  <option key={prop.id} value={prop.name}>
                    {prop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <TimeRangeSelector selected={range} onSelect={setRange} />
        </div>

        {/* Error de datos */}
        {dataError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              <strong>Warning:</strong> {dataError}
            </p>
          </div>
        )}

        {/* Visualizaciones */}
        {data && data.data && data.data.length > 0 && data.property ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfica */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedProperty} ({data.property.unit || ''})
              </h2>
              <LineChart data={data.data} unit={data.property.unit || ''} />
            </div>

            {/* Métricas */}
            <div className="space-y-6">
              {/* Gauge */}
              {currentProp?.type === 'number' && data.current && (
                <div className="bg-white rounded-lg shadow p-6">
                  <GaugeMeter
                    value={data.current.value}
                    min={0}
                    max={data.current.value * 2 || 100}
                    unit={data.property.unit || ''}
                    label={selectedProperty}
                  />
                </div>
              )}

              {/* LED Status */}
              {currentProp?.type === 'boolean' && data.current && (
                <div className="bg-white rounded-lg shadow p-6">
                  <StatusLED
                    status={parseFloat(data.current.raw) > 0 || data.current.raw.toLowerCase() === 'true'}
                    label={selectedProperty}
                  />
                </div>
              )}

              {/* Current Value */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Current Value</h3>
                <div className="text-3xl font-bold">
                  {data.current?.value.toFixed(2) || 'N/A'} {data.property.unit || ''}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Last update: {data.current ? new Date(data.current.timestamp).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              {dataError ? 'Error loading data' : 'No data available for the selected range'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
