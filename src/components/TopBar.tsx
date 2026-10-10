import { Camera, FileVideo } from 'lucide-react';
import type { ChangeEvent } from 'react';

export function TopBar({
  cameraDevices,
  selectedDeviceId,
  onSelectDevice,
  onAddCamera,
  onUploadClick,
  onUploadFile,
  fileInputRef,
}: {
  cameraDevices: MediaDeviceInfo[];
  selectedDeviceId: string;
  onSelectDevice: (deviceId: string) => void;
  onAddCamera: () => void;
  onUploadClick: () => void;
  onUploadFile: (event: ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Meeting Vision Studio</p>
        <h1>Live CV control room</h1>
      </div>
      <div className="topbar-actions">
        <select
          className="camera-select"
          value={selectedDeviceId}
          aria-label="Camera device"
          onChange={(event) => onSelectDevice(event.target.value)}
        >
          <option value="">Default camera</option>
          {cameraDevices.map((device, index) => (
            <option value={device.deviceId} key={device.deviceId}>
              {device.label || `Camera ${index + 1}`}
            </option>
          ))}
        </select>
        <button className="primary-button" onClick={onAddCamera}>
          <Camera size={18} />
          Add camera
        </button>
        <button className="secondary-button" onClick={onUploadClick}>
          <FileVideo size={18} />
          Upload video
        </button>
        <input
          ref={fileInputRef}
          className="hidden-input"
          type="file"
          accept="video/*"
          onChange={onUploadFile}
        />
      </div>
    </header>
  );
}
