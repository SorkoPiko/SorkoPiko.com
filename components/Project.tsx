import Image from "next/image";

export type Badge = {
	src: string;
	height: number;
	width: number;
	alt: string;
};

export type ProjectProps = {
	name: string;
	description: string;
	status: string;
	startTimestamp: number;
	endTimestamp?: number;
	link?: string;
	extra?: Badge;
};

export const Project = ({
	name,
	description,
	status,
	startTimestamp,
	endTimestamp,
	link,
	extra,
}: ProjectProps) => {
	var startTime =
		new Date(startTimestamp * 1000).toLocaleString("en-AU", {
			month: "short",
		}) +
		" " +
		new Date(startTimestamp * 1000).toLocaleString("en-AU", {
			year: "numeric",
		});

	if (endTimestamp) {
		var endTime =
			new Date(endTimestamp * 1000).toLocaleString("en-AU", {
				month: "short",
			}) +
			" " +
			new Date(endTimestamp * 1000).toLocaleString("en-AU", {
				year: "numeric",
			});
	} else {
		if (status === "Ongoing") {
			var endTime = "Present";
		} else {
			var endTime = startTime;
		}
	}

	if (startTime === endTime) {
		var time = startTime;
	} else {
		var time = `${startTime} - ${endTime}`;
	}
	if (!link) {
		link = "#";
	}

	return (
		<a
			className="projectcard p-4 flex-col sm:flex-row flex gap-4 rounded-2xl bg-slate-800"
			target="_blank"
			href={link}
		>
			<div className="flex-1">
				<div className="flex items-center gap-2">
					<p className="text-lg font-bold text-white">{name}</p>
					<p className="text-xs font-semibold rounded-md px-2 py-0.5 bg-slate-900">
						{time}
					</p>
					{status === "Finished" && (
						<p className="text-xs font-semibold rounded-md px-2 py-0.5 bg-green-300 text-black">
							{status}
						</p>
					)}
					{status === "Ongoing" && (
						<p className="text-xs font-semibold rounded-md px-2 py-0.5 bg-yellow-300 text-black">
							{status}
						</p>
					)}
					{status === "Abandoned" && (
						<p className="text-xs font-semibold rounded-md px-2 py-0.5 bg-red-400 text-black">
							{status}
						</p>
					)}

					{extra && (
						<div className="flex items-center">
							<Image
								height={0}
								width={0}
								src={extra.src}
								alt={extra.alt}
								style={{
									width: "auto",
									height: "auto"
								}}
							/>
						</div>
					)}
				</div>
				<p className="text-sm leading-1">{description}</p>
			</div>
		</a>
	);
};
