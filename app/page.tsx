"use client";

import { Typewriter } from "react-simple-typewriter";
import projects from "../public/projects.json";
import { Project } from "@/components/Project";

projects.projects.sort(function (a, b) {
	return b.startTimestamp - a.startTimestamp;
});

const latestProject = projects.projects[0];

export default function Main() {
	return (
		<>
			<div className="flex-col flex justify-center items-center mt-24">
				<h1 className="w-auto font-bold text-6xl from-20% bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-purple-400 float-left">
					SorkoPiko
				</h1>
				<h1 className="text-5xl">
					<Typewriter
						words={[
							"c++ dev",
							"wiki contributor",
							"web dev",
							"discord bot dev",
							"open source contributor",
							"geode mod dev"
						]}
						loop={0}
						cursor={true}
						cursorStyle="_"
						typeSpeed={70}
						deleteSpeed={35}
					/>
				</h1>
				<div className="mt-24">
					<h1 className="text-2xl text-center">{(latestProject.status === "Ongoing") ? "Current Project" : "Latest Project"}</h1>
					<Project {...latestProject} />
				</div>
			</div>
		</>
	);
}
