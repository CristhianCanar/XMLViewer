import type { ModalState } from '../types';

interface ModalProps {
  modal: ModalState | null;
  onClose: () => void;
}

export function Modal({ modal, onClose }: ModalProps) {
  if (!modal) return null;

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-box">
        <h3>{modal.title}</h3>
        <p>{modal.description}</p>
        <ul className="modal-list">
          {modal.items.map((item) => (
            <li key={item.id} onClick={() => modal.onSelect(item.id)}>
              <span className="file-icon">{item.icon}</span>
              <span className="item-text">
                <strong>{item.title}</strong>
                {item.subtitle && <small>{item.subtitle}</small>}
              </span>
              {item.meta && <span className="file-size">{item.meta}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
