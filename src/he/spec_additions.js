describe("Masorah versification", () => {
	let p = {};
	beforeEach(() => {
		p = new bcv_parser(lang);
	});
	it ("should not allow 1 Samuel to Ruth using the default versification", () => {
		expect(p.parse(`1Sam 1-Ruth 1`).osis()).toEqual("1Sam.1,Ruth.1")
		expect(p.parse(`1Sam 1-Matt 1`).osis()).toEqual("1Sam.1-Matt.1")
	});
	it ("should allow 1 Samuel to Ruth using Masorah", () => {
		p.set_options({ versification_system: "masorah" });
		expect(p.parse(`1Sam 1-Ruth 1`).osis()).toEqual("1Sam.1-Ruth.1")
	});
	it ("should allow a range into the New Testament using the default", () => {
		p.set_options({ versification_system: "masorah" });
		expect(p.parse(`Ruth 1-Matt 1`).osis()).toEqual("Ruth.1-Matt.1")
	});
	it ("shouldn't allow a range into the New Testament using the default", () => {
		p.set_options({ versification_system: "masorah" });
		// This is OK because the NT isn't disallowed yet.
		expect(p.parse(`Ruth 1-Matt 1`).osis()).toEqual("Ruth.1-Matt.1")
		p.set_options({ testaments: "o" });
		expect(p.parse(`Ruth 1-Matt 1`).osis()).toEqual("Ruth.1")
	});
});
