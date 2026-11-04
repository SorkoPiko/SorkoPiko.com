import Image from "next/image";
import { beatline, gameCta, geodeMods, links, senddb, site } from "@/lib/content";
import { formatDownloads, getGeodeDownloads } from "@/lib/geode";
import { CopyButton } from "@/components/CopyButton";
import { Icon } from "@/components/Icons";

// Must be a literal for Next to read it; kept equal to DOWNLOADS_REVALIDATE in
// lib/geode.ts (checked by tests/revalidate.test.ts).
export const revalidate = 86400;

export default async function Home() {
	const downloads = await getGeodeDownloads();
	const cta = gameCta(beatline);

	return (
		<main className="column">
			<header className="intro">
				<h1>{site.name}</h1>
				<p className="tagline">{site.tagline}</p>
			</header>

			<section aria-labelledby="next-up">
				<h2 id="next-up" className="label">Next up</h2>
				<div className="feature">
					<Image
						className="feature-image"
						src={beatline.image.src}
						width={beatline.image.width}
						height={beatline.image.height}
						alt={beatline.image.alt}
						sizes="(max-width: 680px) calc(100vw - 3rem), 610px"
						quality={90}
						priority
					/>
					<div className="feature-body">
						<div className="feature-heading">
							<h3 className="feature-name">{beatline.name}</h3>
							<span className="badge">{cta.badge}</span>
						</div>
						{cta.link && (
							<a className="feature-link" href={cta.link.href} target="_blank" rel="noopener noreferrer">
								{cta.link.label}
							</a>
						)}
					</div>
				</div>
			</section>

			<section aria-labelledby="projects">
				<h2 id="projects" className="label">Projects</h2>
				<ul className="projects">
					<li>
						<h3>
							<a href={senddb.url} target="_blank" rel="noopener noreferrer">{senddb.name}</a>
						</h3>
						<p>{senddb.description}</p>
					</li>
					<li>
						<h3>
							<a href={geodeMods.url} target="_blank" rel="noopener noreferrer">{geodeMods.name}</a>
						</h3>
						<p>
							{geodeMods.description}{" "}
							<span className="stat">{formatDownloads(downloads)} downloads</span>
						</p>
					</li>
				</ul>
			</section>

			<section aria-labelledby="links">
				<h2 id="links" className="label">Links</h2>
				<ul className="links">
					{links.map((link) => (
						<li key={link.label}>
							{link.copy ? (
								<CopyButton text={link.copy} label={link.label}>
									<Icon name={link.icon} />
									<span>{link.label}</span>
								</CopyButton>
							) : (
								<a
									className="link-row"
									href={link.href}
									{...(link.href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
								>
									<Icon name={link.icon} />
									<span>{link.label}</span>
									{link.handle && <span className="link-handle">{link.handle}</span>}
								</a>
							)}
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
