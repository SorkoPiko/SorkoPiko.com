import { beatline, geodeMods, links, senddb, site } from "@/lib/content";
import { formatDownloads, getGeodeDownloads } from "@/lib/geode";
import { CopyButton } from "@/components/CopyButton";
import { Icon } from "@/components/Icons";

export const revalidate = 86400;

export default async function Home() {
	const downloads = await getGeodeDownloads();
	const released = beatline.status === "released";

	return (
		<main className="column">
			<header className="intro">
				<h1>{site.name}</h1>
				<p className="tagline">{site.tagline}</p>
			</header>

			<section aria-labelledby="beatline">
				<h2 className="label">Next up</h2>
				<div className="feature">
					<span className="badge">{released ? "Out now on Steam" : "Coming soon to Steam"}</span>
					<h3 id="beatline" className="feature-name">{beatline.name}</h3>
					<p className="pitch">{beatline.pitch}</p>
					{beatline.steamUrl && (
						<a className="feature-link" href={beatline.steamUrl} target="_blank" rel="noopener noreferrer">
							{released ? "Get it on Steam" : "Wishlist on Steam"}
						</a>
					)}
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
								<CopyButton text={link.copy}>
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
