import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type WorkItem = {
	id: string;
	title: string;
	thumbSrc: string;
	thumbWidth: number;
	thumbHeight: number;
	bodyHtml: string;
};

type Props = {
	works: WorkItem[];
	stickerSrcs: string[];
};

function randomBetween(min: number, max: number) {
	return min + Math.random() * (max - min);
}

function DraggableSticker({
	src,
	initialXPct,
	initialYPct,
	constraintsRef,
}: {
	src: string;
	initialXPct: number;
	initialYPct: number;
	constraintsRef: RefObject<HTMLDivElement | null>;
}) {
	return (
		<motion.div
			className="pointer-events-auto absolute h-14 w-14 cursor-grab touch-none overflow-hidden rounded-sm border border-black/10 bg-white active:cursor-grabbing md:h-16 md:w-16"
			style={{ left: `${initialXPct}%`, top: `${initialYPct}%` }}
			drag
			dragConstraints={constraintsRef}
			dragElastic={0.12}
			dragMomentum={false}
			whileDrag={{ scale: 1.03, zIndex: 35 }}
		>
			<img src={src} alt="" className="h-full w-full object-cover select-none" draggable={false} />
		</motion.div>
	);
}

function WorkModal({ work, onClose }: { work: WorkItem; onClose: () => void }) {
	return (
		<motion.div
			className="fixed inset-0 z-50 flex"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
		>
			<button
				type="button"
				className="h-full min-w-0 flex-1 cursor-default bg-transparent"
				aria-label="닫기"
				onClick={onClose}
			/>
			<motion.div
				className="pointer-events-auto relative my-6 flex max-h-[calc(100dvh-3rem)] w-full max-w-lg shrink-0 flex-col overflow-y-auto rounded-sm bg-cream px-5 pb-8 pt-6 md:my-10 md:max-h-[calc(100dvh-5rem)] md:max-w-2xl md:px-8"
				initial={{ y: 16, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: 12, opacity: 0 }}
				transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby={`work-title-${work.id}`}
			>
				<div className="relative mb-5 w-full overflow-hidden rounded-sm bg-white">
					<img
						src={work.thumbSrc}
						alt=""
						className="mx-auto max-h-[55dvh] w-full object-contain"
						width={work.thumbWidth}
						height={work.thumbHeight}
						draggable={false}
					/>
				</div>
				<h2
					id={`work-title-${work.id}`}
					className="mb-3 font-sans text-base font-medium lowercase tracking-[var(--tracking-sans)] text-ink"
				>
					{work.title}
				</h2>
				<div
					className="work-modal-body font-serif text-[0.95rem] leading-relaxed text-ink/90 [&_a]:underline [&_p+p]:mt-3"
					dangerouslySetInnerHTML={{ __html: work.bodyHtml }}
				/>
			</motion.div>
			<button
				type="button"
				className="h-full min-w-0 flex-1 cursor-default bg-transparent"
				aria-label="닫기"
				onClick={onClose}
			/>
		</motion.div>
	);
}

export default function HomePortfolio({ works, stickerSrcs }: Props) {
	const constraintsRef = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);
	const [stickers, setStickers] = useState<
		Array<{ key: string; src: string; x: number; y: number }>
	>([]);
	const [selected, setSelected] = useState<WorkItem | null>(null);

	useEffect(() => {
		setMounted(true);
		const pool = stickerSrcs.length ? stickerSrcs : ["/favicon.svg"];
		const count = 1;
		const next: Array<{ key: string; src: string; x: number; y: number }> = [];
		for (let i = 0; i < count; i++) {
			next.push({
				key: `float-${i}-${Math.random().toString(36).slice(2)}`,
				src: pool[i % pool.length]!,
				x: randomBetween(4, 78),
				y: randomBetween(10, 82),
			});
		}
		setStickers(next);
	}, [stickerSrcs]);

	useEffect(() => {
		if (!selected) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setSelected(null);
		};
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", onKey);
		};
	}, [selected]);

	return (
		<div className="relative mx-auto w-[360px] pb-16 pt-2 md:w-[1180px] md:pt-4">
			<div
				ref={constraintsRef}
				className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
				aria-hidden
			>
				{mounted &&
					stickers.map((s) => (
						<DraggableSticker
							key={s.key}
							src={s.src}
							initialXPct={s.x}
							initialYPct={s.y}
							constraintsRef={constraintsRef}
						/>
					))}
			</div>

			<div
				className={`relative z-10 transition-opacity duration-300 ease-out ${
					selected ? "pointer-events-none opacity-20" : "opacity-100"
				}`}
			>
				<div className="columns-1 gap-x-6 gap-y-0 md:columns-3 [&>*]:break-inside-avoid">
					{works.map((w, i) => (
						<button
							key={w.id}
							type="button"
							className={[
								"group mb-8 block w-full cursor-pointer text-left md:mb-10",
								i % 5 === 1 ? "md:mt-12" : "",
								i % 5 === 3 ? "md:mt-8" : "",
								i % 5 === 4 ? "md:mt-4" : "",
							]
								.filter(Boolean)
								.join(" ")}
							onClick={() => setSelected(w)}
						>
							<div className="overflow-hidden rounded-sm bg-white/60">
								<img
									src={w.thumbSrc}
									alt=""
									className="w-full object-cover"
									width={w.thumbWidth}
									height={w.thumbHeight}
									loading="lazy"
									decoding="async"
									draggable={false}
								/>
							</div>
							<h2 className="mt-3 font-sans text-sm font-medium lowercase tracking-[var(--tracking-sans)] text-ink">
								{w.title}
							</h2>
						</button>
					))}
				</div>
			</div>

			<AnimatePresence>
				{selected ? <WorkModal work={selected} onClose={() => setSelected(null)} /> : null}
			</AnimatePresence>
		</div>
	);
}
