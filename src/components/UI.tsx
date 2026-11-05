import {
  ArrowRight,
  Check,
  Code,
  Graph,
  TreeStructure,
  BookOpen,
  Star,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, type ReactNode } from "react";
import type { Subject } from "../lib/content";
export const go = (path: string) => {
  window.location.hash = path;
};
export const icons = {
  network: Graph,
  router: TreeStructure,
  code: Code,
  book: BookOpen,
};
export function SubjectIcon({
  subject,
  size = 24,
}: {
  subject: Subject;
  size?: number;
}) {
  const Icon = icons[subject.icon];
  return (
    <span className={`subject-icon ${subject.color}`}>
      <Icon size={size} weight="duotone" />
    </span>
  );
}
export function ProgressBar({
  value,
  color = "",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div
      className={`progress-track ${color}`}
      role="progressbar"
      aria-label="Progression"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon || <BookOpen size={32} />}</span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function FavoriteButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`icon-button favorite ${active ? "active" : ""}`}
      onClick={onClick}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={active}
    >
      <Star size={21} weight={active ? "fill" : "regular"} />
    </button>
  );
}
export function Toast({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="toast" role="status">
      <Check size={20} />
      <span>{children}</span>
      <button
        className="icon-button"
        onClick={onClose}
        aria-label="Fermer la notification"
      >
        <X size={18} />
      </button>
    </div>
  );
}
export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}
export function TextLink({
  children,
  to,
}: {
  children: ReactNode;
  to: string;
}) {
  return (
    <a className="text-link" href={`#${to}`}>
      {children}
      <ArrowRight size={17} />
    </a>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="Fermer">
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
