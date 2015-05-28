'use strict'

var CharacterGenerator = React.createClass({displayName: "CharacterGenerator",

	getInitialState: function() {
		var state = {
			name: '',
			species: 3,
			obligation: {
				type: 3,
				value: 10,
				additional: [false, false, false, false]
			},
			career: 4,
			specialization: 12,
			skills: [],
			additionalSpecializations: []
		};
		
		// almost an antipattern (but it is not)
		this.props.master.skills.forEach(function(item, index) {
			state.skills.push({
				species: 0,
				career: 0,
				spec: 0,
				bought: 0
			});
		});
		
		return state;
	},


	/////////////////
	//  ui events  //
	/////////////////
	
	onNameChange: function(event) {
		this.setState({ name: event.target.value });
	},

	onSpeciesChange: function(event) {
		this.setState({ species: parseInt(event.target.value) });
	},

	onObligationTypeChange: function(event) {
		var t = parseInt(event.target.value);
		var s = React.addons.update(this.state, { obligation: { type: { $set: t }}});
		this.setState(s);
	},

	onObligationValueChange: function(event) {
		var v = parseInt(event.target.value);
		var o = this.state.obligation.value;
		var s = React.addons.update(this.state, { obligation: { value: { $set: v }}});
		if (v < o) {
			s = React.addons.update(s, { obligation: { additional: { $set: [false, false, false, false] }}});
		}
		this.setState(s);
	},

	onAdditionalObligationChange: function(event) {
		var i = event.target.value;
		var v = event.target.checked;
		var s = React.addons.update(this.state, { obligation: { additional: { $splice: [[i, 1, v]] }}});
		this.setState(s);
	},

	onCareerChange: function(event) {
		var c = parseInt(event.target.value);
		var sp = this.props.master.careers[c].specializations[0];
		var s = this.state.skills.map(function(skill) {
			skill.career = 0;
			skill.spec = 0;
			return skill;
		});
		this.setState({ career: c, specialization: sp, skills: s });
	},

	onSpecializationChange: function(event) {
		var sp = parseInt(event.target.value);
		var s = this.state.skills.map(function(skill) {
			skill.spec = 0;
			return skill;
		});

		this.setState({ specialization: sp, skill:s });
	},

	onCareerSkillChange: function(event) {
		var i = parseInt(event.target.value);
		var v = this.state.skills[i];
		v.career = (event.target.checked ? 1 : 0);
		var s = React.addons.update(this.state, { skills: { $splice: [[i, 1, v]] }});
		this.setState(s);
	},

	onSpecSkillChange: function(event) {
		var i = parseInt(event.target.value);
		var v = this.state.skills[i];
		v.spec = (event.target.checked ? 1 : 0);
		var s = React.addons.update(this.state, { skills: { $splice: [[i, 1, v]] }});
		this.setState(s);
	},

	onAdditionalSpecializationClick: function(event) {
		var sp = parseInt(event.target.value);
		var i = this.state.additionalSpecializations.indexOf(sp);
		if (i === -1) {
			var s = React.addons.update(this.state, {additionalSpecializations : { $push: [sp] }});
		} else {
			var s = React.addons.update(this.state, {additionalSpecializations : { $splice: [[i, 1]] }});
		}
		this.setState(s);
	},

	/////////////////
	//   helpers   //
	/////////////////

	xp: function() {
		var result = [];
		var a = this.props.master.additionalObligations;
		var x = this.props.master.species[this.state.species].xp;
		x += this.state.obligation.additional.reduce(function(prev, item, index) {
			return prev + (item ? a[index].xp : 0);
		}, 0);
		result.push(x);
		
		var s = this.props.master.specializations;
		var c = this.state.career;
		x = this.state.additionalSpecializations.reduce(function(prev, item, index) {
			return prev + ((s[item].career === c) ? (index + 1) * 10 : (index + 2) * 10);
		}, 0);
		alert(x);
		result.push(x);

		return result;
	},

	/////////////////
	//   render    //
	/////////////////

	render: function() {

		var speciesOptions = this.props.master.species.map(function (item, index) {
			return (
				React.createElement("option", {key: index, value: index}, item.name)
			);
		});

		return (
			React.createElement("form", null, 
				React.createElement("div", {className: "row"}, 
					React.createElement("div", {className: "col-xs-10 col-xs-offset-1"}, 
						React.createElement("div", {className: "row navigator", id: "general"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement("div", {className: "panel panel-default"}, 
									React.createElement("div", {className: "panel-heading"}, 
										React.createElement("h3", {className: "panel-title"}, "General information")
									), 
									React.createElement("div", {className: "panel-body"}, 
										React.createElement("div", {className: "form-group"}, 
											React.createElement("label", {htmlFor: "nameInput"}, "Name"), 
											React.createElement("input", {type: "text", className: "form-control input-sm", id: "nameInput", placeholder: "name your character", 
													value: this.state.name, onChange: this.onNameChange})
										), 
										React.createElement("div", {className: "form-group"}, 
											React.createElement("label", {htmlFor: "speciesSelect"}, "Species"), 
											React.createElement("select", {className: "form-control input-sm", id: "speciesSelect", 
													value: this.state.species, onChange: this.onSpeciesChange}, 
												speciesOptions
											)
										)
									)
								)
							)
						), 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement(Obligation, {
										obligations: this.props.master.obligations, 
										additionalObligations: this.props.master.additionalObligations, 
										obligation: this.state.obligation, 
										onTypeChange: this.onObligationTypeChange, 
										onValueChange: this.onObligationValueChange, 
										onAdditionalChange: this.onAdditionalObligationChange})
							)
						), 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-sm-6"}, 
								React.createElement(Career, {
										careers: this.props.master.careers, 
										skillList: this.props.master.skills, 
										career: this.state.career, 
										skills: this.state.skills, 
										onCareerChange: this.onCareerChange, 
										onCareerSkillChange: this.onCareerSkillChange})
							), 
							React.createElement("div", {className: "col-sm-6"}, 
								React.createElement(Specialization, {
										careers: this.props.master.careers, 
										specializations: this.props.master.specializations, 
										skillList: this.props.master.skills, 
										career: this.state.career, 
										specialization: this.state.specialization, 
										skills: this.state.skills, 
										onSpecializationChange: this.onSpecializationChange, 
										onSpecSkillChange: this.onSpecSkillChange})
							)
						), 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement(AdditionalSpecializations, {
										careers: this.props.master.careers, 
										specializations: this.props.master.specializations, 
										career: this.state.career, 
										specialization: this.state.specialization, 
										additionalSpecializations: this.state.additionalSpecializations, 
										onClick: this.onAdditionalSpecializationClick}), 
								JSON.stringify(this.xp())
							)
						), 
						React.createElement("div", {className: "row navigator", id: "characteristics"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement(Characteristics, {characteristics: this.props.master.characteristics})
							)
						), 
						React.createElement("div", {className: "row navigator", id: "skills"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement(Skills, {skills: this.props.master.skills, 
									characteristics: this.props.master.characteristics})
							)
						), 
						React.createElement("div", {className: "row navigator", id: "equipment"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement("div", {className: "panel panel-default"}, 
									React.createElement("div", {className: "panel-heading"}, 
										React.createElement("h3", {className: "panel-title"}, " Equipment ")
									), 
									React.createElement("div", {className: "panel-body"}, 
										"Equipment"
									)
								)
							)
						)
						
					)
				)
			)
		);
	}
});

var Obligation = React.createClass({displayName: "Obligation",
	render: function() {

		var typeOptions = this.props.obligations.map(function(item, index) {
			return (
				React.createElement("option", {key: index, value: index}, item.name)
			);
		});

		var addObligations = this.props.additionalObligations;
		var totalAdditional = this.props.obligation.additional.reduce(function(prev, curr, index) {
			return (prev + (curr ? addObligations[index].obligation : 0));
		}, 0);

		var checkBoxes = addObligations.map(function(item, index) {
			var addStatus = this.props.obligation.additional[index];
			var disable = !addStatus && (item.obligation > this.props.obligation.value - totalAdditional);
			
			return (
				React.createElement("div", {key: index, className: disable ? "checkbox disabled" : "checkbox"}, 
					React.createElement("label", null, 
						React.createElement("input", {type: "checkbox", value: index, checked: addStatus, disabled: disable, 
							onChange: this.props.onAdditionalChange}), 
						item.name
					)
				)
			);
		}, this);

		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Obligation")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "col-sm-6"}, 
						React.createElement("div", {className: "form-group"}, 
							React.createElement("label", {htmlFor: "obligationTypeSelect"}, "Type"), 
							React.createElement("select", {className: "form-control input-sm", id: "obligationTypeSelect", 
								value: this.props.obligation.type, onChange: this.props.onTypeChange}, 
								typeOptions
							)
						), 
						React.createElement("div", {className: "form-group"}, 
							React.createElement("label", {htmlFor: "obligationSizeSelect"}, "Starting Value"), 
							React.createElement("select", {className: "form-control input-sm", id: "speciesSelect", 
								value: this.props.obligation.value, onChange: this.props.onValueChange}, 
								React.createElement("option", {value: "20"}, "20 (2 players)"), 
								React.createElement("option", {value: "15"}, "15 (3 players)"), 
								React.createElement("option", {value: "10"}, "10 (4-5 players)"), 
								React.createElement("option", {value: "5"}, "5  (6+ players)")
							)
						)
					), 
					React.createElement("div", {className: "col-sm-6"}, 
						React.createElement("div", {className: "form-group"}, 
							React.createElement("label", {htmlFor: "additionalObligationCheckbox"}, "Additional Obligation"), 
							React.createElement("div", {id: "additionalObligationCheckboxes"}, 
								checkBoxes
							)
						)
					)
				), 
				React.createElement("div", {className: "panel-footer"}, 
					"Total obligation: ", (this.props.obligation.value + totalAdditional)
				)
			)
		);
	}
});

var Career = React.createClass({displayName: "Career",
	render: function() {

		var careerOptions = this.props.careers.map(function(item, index) {
			return (
				React.createElement("option", {key: index, value: index}, item.name)
			);
		});

		var skillList = this.props.skillList;
		var skills = this.props.skills;
		var selectedCareer = this.props.careers[this.props.career];
		var onChange = this.props.onCareerSkillChange;

		var count = skills.reduce(function(prev, item) { return prev + item.career; }, 0);
		var total = 4;
		var full = (count === total);

		var skillCheckBoxes = selectedCareer.skills.map(function(item) {
			var status = (skills[item].career === 1);
			var disable = !status && full;

			return (
				React.createElement("div", {key: item, className: disable ? "checkbox disabled" : "checkbox"}, 
					React.createElement("label", null, 
						React.createElement("input", {type: "checkbox", value: item, 
								checked: status, disabled: disable, 
								onChange: onChange}), 
						skillList[item].name
					)
				)
			);
		});

		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Career")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "CareerSelect"}, "Name"), 
						React.createElement("select", {className: "form-control input-sm", id: "CareerSelect", 
								value: this.props.career, onChange: this.props.onCareerChange}, 
							careerOptions
						)
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "careerSkillCheckbox"}, "Skills"), 
						React.createElement("div", {id: "careerSkillCheckbox"}, 
							skillCheckBoxes
						)
					)
				), 
				React.createElement("div", {className: "panel-footer"}, 
					"Skills selected: ", count, " / ", total
				)
			)
		);
	}
});

var Specialization = React.createClass({displayName: "Specialization",
	render: function() {
		var selectedCareer = this.props.careers[this.props.career];
		var specs = this.props.specializations;

		var specializationOptions	= selectedCareer.specializations.map(function(item) {
			return (
				React.createElement("option", {key: item, value: item}, specs[item].name)
			);
		});

		var skillList = this.props.skillList;
		var skills = this.props.skills;
		var selectedSpecialization = this.props.specializations[this.props.specialization];
		var onChange = this.props.onSpecSkillChange;

		var count = skills.reduce(function(prev, item) { return prev + item.spec; }, 0);
		var total = 2;
		var full = (count === total);

		var skillCheckBoxes = selectedSpecialization.skills.map(function(item) {
			var status = (skills[item].spec === 1);
			var disable = !status && full;

			return (
				React.createElement("div", {key: item, className: disable ? "checkbox disabled" : "checkbox"}, 
					React.createElement("label", null, 
						React.createElement("input", {type: "checkbox", value: item, 
								checked: status, disabled: disable, 
								onChange: onChange}), 
						skillList[item].name
					)
				)
			);
		});

		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Specialization")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "SpecializationSelect"}, "Name"), 
						React.createElement("select", {className: "form-control input-sm", id: "SpecializationSelect", 
								value: this.props.specialization, onChange: this.props.onSpecializationChange}, 
							specializationOptions
						)
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "specializationSkillCheckbox"}, "Skills"), 
						React.createElement("div", {id: "specializationSkillCheckbox"}, 
							skillCheckBoxes
						)
					)
				), 
				React.createElement("div", {className: "panel-footer"}, 
					"Skills selected: ", count, " / ", total
				)

			)
		);
	}
});

var AdditionalSpecializations = React.createClass({displayName: "AdditionalSpecializations",
	render: function() {

		var selectedCareer = this.props.career;
		var selectedSpecialization = this.props.specialization;
		var specs = this.props.specializations;
		var addSpecs = this.props.additionalSpecializations;
		var onClick = this.props.onClick;

		var rows = this.props.careers.map(function(career, careerIndex) {

			var cells = career.specializations.map(function(specialization) {

				var style = "btn btn-block btn-sm" // "btn-default";
				var disable = false;
				if (addSpecs.indexOf(specialization) !== -1) {
					style += " active";
				}
				if (specialization === selectedSpecialization) {
					style += " active";
					disable = true;
				}
				if (careerIndex === selectedCareer) {
					style += " btn-primary";
				} else {
					style += " btn-default";
				}

				return (
					React.createElement("div", {key: specialization, className: "col-sm-3"}, 
						React.createElement("button", {type: "button", value: specialization, className: style, disabled: disable, 
								onClick: onClick}, 
							specs[specialization].name
						)
					)
				);
			});

			return (
				React.createElement("div", {key: careerIndex, className: "row"}, 
					React.createElement("div", {className: "col-sm-3"}, career.name), 
					cells
				)
			);
		});

		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Additional Specializations")
				), 
				React.createElement("div", {className: "panel-body"}, 
					rows
				), 
				React.createElement("div", {className: "panel-footer"}, 
					React.createElement("div", {className: "row"}, 
						React.createElement("div", {className: "col-sm-3"}, "XP Spent:"), 
						React.createElement("div", {className: "col-sm-9"}, React.createElement(XPBar, null))
					)
				)
			)
		);
	}
});

var Characteristics = React.createClass({displayName: "Characteristics",
	render: function() {
		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Characteristics")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "row"}, 
						React.createElement("div", {className: "col-sm-4"}, 
							React.createElement(CharacteristicInput, {characteristic: this.props.characteristics[0]})
						), 
						React.createElement("div", {className: "col-sm-4"}, 
							React.createElement(CharacteristicInput, {characteristic: this.props.characteristics[1]})
						), 
						React.createElement("div", {className: "col-sm-4"}, 
							React.createElement(CharacteristicInput, {characteristic: this.props.characteristics[2]})
						)
					), 
					React.createElement("div", {className: "row"}, 
						React.createElement("div", {className: "col-sm-4"}, 
							React.createElement(CharacteristicInput, {characteristic: this.props.characteristics[3]})
						), 
						React.createElement("div", {className: "col-sm-4"}, 
							React.createElement(CharacteristicInput, {characteristic: this.props.characteristics[4]})
						), 
						React.createElement("div", {className: "col-sm-4"}, 
							React.createElement(CharacteristicInput, {characteristic: this.props.characteristics[5]})
						)
					)
				)
			)
		);
	}
});

var CharacteristicInput = React.createClass({displayName: "CharacteristicInput",
	render: function() {
		var chr = this.props.characteristic;
		return (
			React.createElement("div", {className: "form-group"}, 
				React.createElement("label", {htmlFor: "{chr.abbr}"}, chr.name, " ", React.createElement("small", null, "[", chr.abbr, "]")), 
				React.createElement("input", {type: "number", className: "form-control input-sm", id: "{chr.abbr}", min: "2", max: "5", defaultValue: "2"})
			)
		);
	}
});

var Skills = React.createClass({displayName: "Skills",
	render: function() {
		var chars = this.props.characteristics;
		var COLS = 2;
		var width = 12 / COLS;
		var allSkills = [];
		for (var i = 0; i < COLS; i++) {
			var skills = this.props.skills.
				filter(function(item, index) { return (index % COLS === i); }).
				map(function(item, index) {
					return (
						React.createElement("tr", {key: index}, 
							React.createElement("td", null, item.name, " ", React.createElement("small", null, "[", chars[item.chr].abbr, "]"), " "), 
							React.createElement("td", null, 
								React.createElement("input", {type: "number", 
									className: "form-control input-sm input-sm", 
									id: 'skill-' + index, 
									min: "0", max: "5", defaultValue: "0"})
							), 
							React.createElement("td", null, " YGG ")
						)
					);
			});
			allSkills.push(
				React.createElement("div", {key: i, className: 'col-sm-' + width}, 
					React.createElement("table", {className: "table table-condensed form-horizontal"}, 
						React.createElement("thead", null, 
							React.createElement("tr", null, 
								React.createElement("th", null, "Skill ", React.createElement("small", null, "[Char.]"), " "), 
								React.createElement("th", null, "Value"), 
								React.createElement("th", null, "Roll")
							)
						), 
						React.createElement("tbody", null, 
							skills
						)
					)
				)
			);
		}
		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, " Skills ")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "row"}, 
						allSkills
					)
				)
			)
		);
	}
});

var XPBar = React.createClass({displayName: "XPBar",
	render: function() {

		return (
			React.createElement("div", {className: "progress"}, 
				React.createElement("div", {className: "progress-bar progress-bar-info", role: "progressbar", style: {width: "10%"}}), 
				React.createElement("div", {className: "progress-bar progress-bar-info", role: "progressbar", style: {width: "30%"}}), 
				React.createElement("div", {className: "progress-bar progress-bar-danger", role: "progressbar", style: {width: "20%"}}), 
				React.createElement("div", {className: "progress-bar progress-bar-info", role: "progressbar", style: {width: "20%"}})
			)
		);
	}
});

// entry point

$.ajax({ url: "master.json", dataType: "json" })
	.done(function(master) {
		React.render( React.createElement(CharacterGenerator, {master: master}) , document.getElementById("characterGenerator"));
	})
	.fail(function(request, status, exception) {
		alert('Request for ' + this.url + ' failed with: ' + exception.toString());
	});

var Template = React.createClass({displayName: "Template",
	render: function() {
		return (
			''
		);
	}
});
