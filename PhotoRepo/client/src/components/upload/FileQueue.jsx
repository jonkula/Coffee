import { CheckCircle, XCircle, Loader } from 'lucide-react';

export function FileQueue({ queue }) {
  if (queue.length === 0) return null;

  return (
    <div className="file-queue">
      {queue.map((item) => (
        <div key={item.id} className={`file-queue__item file-queue__item--${item.status}`}>
          <span className="file-queue__name">{item.file.name}</span>
          <div className="file-queue__right">
            {item.status === 'uploading' && (
              <>
                <div className="file-queue__bar">
                  <div className="file-queue__fill" style={{ width: `${Math.round(item.progress * 100)}%` }} />
                </div>
                <Loader size={14} className="spin" />
              </>
            )}
            {item.status === 'done' && <CheckCircle size={16} color="var(--green)" />}
            {item.status === 'error' && <XCircle size={16} color="var(--red)" title={item.error} />}
          </div>
        </div>
      ))}
    </div>
  );
}
