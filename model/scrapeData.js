export class Data {
	constructor(id, date, skill, jobs) {
		this.id = id;
		this.date = date;
		this.skill = skill;
		this.jobs = jobs;
	}
}
export class Skill {
	constructor(skillId, skill) {
		this.skillId = skillId;
		this.skill = skill;
	}
}
export class SkillData {
	constructor(id, date, jobs) {
		this.id = id;
		this.date = date;
		this.jobs = jobs;
	}
}