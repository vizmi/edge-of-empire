'use strict'

var CharacterGenerator = React.createClass({displayName: "CharacterGenerator",
	render: function() {
		return (
			React.createElement("form", null, 
				React.createElement("div", {className: "row"}, 
					React.createElement("div", {className: "col-xs-10 col-xs-offset-1"}, 
						React.createElement("div", {className: "row navigator", id: "general"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement(GeneralInfo, {species: this.props.master.species})
							)
						), 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement(Obligation, {
									obligations: this.props.master.obligations, 
									additionalObligations: this.props.master.additionalObligations})
							)
						), 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-sm-6"}, 
								React.createElement(Career, {
									careers: this.props.master.careers, 
									skills: this.props.master.skills})
							), 
							React.createElement("div", {className: "col-sm-6"}, 
								React.createElement(Specialization, {
									careers: this.props.master.careers, 
									skills: this.props.master.skills})
							)
						), 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement(AdditionalSpecialization, {
									careers: this.props.master.careers})
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

var GeneralInfo = React.createClass({displayName: "GeneralInfo",
	render: function() {
		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "General information")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement(NameInput, null), 
					React.createElement(SpeciesSelect, {species: this.props.species})
				)
			)
		);
	}
});

var NameInput = React.createClass({displayName: "NameInput",
	render: function() {
		return (
			React.createElement("div", {className: "form-group"}, 
				React.createElement("label", {htmlFor: "nameInput"}, "Name"), 
				React.createElement("input", {type: "text", className: "form-control input-sm", id: "nameInput", placeholder: "name your character"})
			)
		);
	}
});

var SpeciesSelect = React.createClass({displayName: "SpeciesSelect",
	render: function() {

		var options = this.props.species.map(function (item, index) {
			return (
				React.createElement("option", {key: index}, item.name)
			);
		});

		return (
			React.createElement("div", {className: "form-group"}, 
				React.createElement("label", {htmlFor: "speciesSelect"}, "Species"), 
				React.createElement("select", {className: "form-control input-sm", id: "speciesSelect"}, 
					options
				)
			)
		);
	}
});

var Obligation = React.createClass({displayName: "Obligation",
	render: function() {
		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Obligation")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "col-sm-6"}, 
						React.createElement(ObligationTypeSelect, {obligations: this.props.obligations}), 
						React.createElement(ObligationSizeSelect, null)
					), 
					React.createElement("div", {className: "col-sm-6"}, 
						React.createElement(AdditionalObligationCheckBoxes, {additionalObligations: this.props.additionalObligations})
					)
				)
			)
		);
	}
});

var ObligationTypeSelect = React.createClass({displayName: "ObligationTypeSelect",
	render: function() {

		var options = this.props.obligations.map(function (item, index) {
			return (
				React.createElement("option", {key: index}, item.name)
			);
		});

		return (
			React.createElement("div", {className: "form-group"}, 
				React.createElement("label", {htmlFor: "obligationTypeSelect"}, "Type"), 
				React.createElement("select", {className: "form-control input-sm", id: "obligationTypeSelect"}, 
					options
				)
			)
		);
	}
});

var ObligationSizeSelect = React.createClass({displayName: "ObligationSizeSelect",
	render: function() {
		return (
			React.createElement("div", {className: "form-group"}, 
				React.createElement("label", {htmlFor: "obligationSizeSelect"}, "Starting Value"), 
				React.createElement("select", {className: "form-control input-sm", id: "speciesSelect"}, 
					React.createElement("option", null, "20 (2 players)"), 
					React.createElement("option", null, "15 (3 players)"), 
					React.createElement("option", null, "10 (4-5 players)"), 
					React.createElement("option", null, "5  (6+ players)")
				)
			)
		);
	}
});

var AdditionalObligationCheckBoxes = React.createClass({displayName: "AdditionalObligationCheckBoxes",
	render: function() {

		var checkBoxes = this.props.additionalObligations.map(function (item, index) {
			return (
				React.createElement("div", {key: index, className: "checkbox"}, 
					React.createElement("label", null, 
						React.createElement("input", {type: "checkbox", value: index}), 
						item.name
					)
				)
			);
		});

		return (
			React.createElement("div", {className: "form-group"}, 
				React.createElement("label", {htmlFor: "additionalObligationCheckbox"}, "Additional Obligation"), 
				React.createElement("div", {id: "additionalObligationCheckboxes"}, 
					checkBoxes
				)
			)
		);
	}
});

var Career = React.createClass({displayName: "Career",
	render: function() {

		// this points to something else inside the map function,
		// so we create an alternate name for the stuff we use
		var skills = this.props.skills;
		//TODO selected career
		var selectedCareer = this.props.careers[0];
		
		var careerOptions = this.props.careers.map(function(item, index) {
			return (
				React.createElement("option", {key: index}, item.name)
			);
		});

		var skillCheckBoxes = selectedCareer.skills.map(function (item, index) {
			return (
				React.createElement("div", {key: index, className: "checkbox"}, 
					React.createElement("label", null, 
						React.createElement("input", {type: "checkbox", value: index}), skills[item].name)
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
						React.createElement("select", {className: "form-control input-sm", id: "CareerSelect"}, 
							careerOptions
						)
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "careerSkillCheckbox"}, "Skills"), 
						React.createElement("div", {id: "careerSkillCheckbox"}, 
							skillCheckBoxes
						)
					)
				)
			)
		);
	}
});

var Specialization = React.createClass({displayName: "Specialization",
	render: function() {
		// this points to something else inside the map function,
		// so we create an alternate name for the stuff we use
		var skills = this.props.skills;
		//TODO: selected career
		var selectedCareer = this.props.careers[0];
		//TODO: selected specialization
		var selectedSpecialization = this.props.careers[0].specializations[0];

		var specializationOptions = selectedCareer.specializations.map(function(item, index) {
			return (
				React.createElement("option", {key: index}, item.name)
			);
		});

		var skillCheckBoxes = selectedSpecialization.skills.map(function(item, index) {
			return (
				React.createElement("div", {key: index, className: "checkbox"}, 
					React.createElement("label", null, 
						React.createElement("input", {type: "checkbox", value: index}), skills[item].name)
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
						React.createElement("select", {className: "form-control input-sm", id: "SpecializationSelect"}, 
							specializationOptions
						)
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "specializationSkillCheckbox"}, "Skills"), 
						React.createElement("div", {id: "specializationSkillCheckbox"}, 
							skillCheckBoxes
						)
					)
				)
			)
		);
	}
});

var AdditionalSpecialization = React.createClass({displayName: "AdditionalSpecialization",
	render: function() {
		//TODO: selected career
		var selectedCareerIndex = 0;
		//TODO: selected specialization
		var selectedSpecializationIndex = 0;

		var specializations = this.props.careers.map(function(career, careerIndex) {
			var careerSpecs = career.specializations.map(function(specialization, specIndex) {
				var style = "col-sm-4";
				var disabled = false;
				if (careerIndex === selectedCareerIndex) {
					style = "col-sm-4 bg-info";
					if (specIndex === selectedSpecializationIndex) {
						style = "col-sm-4 bg-primary";
						disabled = true;
					}
				}
				return (
					React.createElement("div", {key: specIndex, className: style}, 
						React.createElement("div", {className: "checkBox"}, 
							React.createElement("label", {className: "control-label"}, 
								React.createElement("input", {type: "checkbox", value: specIndex, disabled: disabled}), specialization.name)
						)
					)
				);
			});
			return (
				React.createElement("div", {key: careerIndex, className: "row"}, 
					careerSpecs
				)
			);
		});

		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Additional Specializations")
				), 
				React.createElement("div", {className: "panel-body"}, 
					specializations
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


// entry point

$.ajax({ url: "master.json", dataType: "json" })
	.done(function(master) {
		React.render(
			React.createElement(CharacterGenerator, {master: master}),
			document.getElementById('characterGenerator')
		);

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
