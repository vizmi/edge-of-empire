'use strict'

var CharacterGenerator = React.createClass({
	render: function() {
		return (
			<form>
				<div className="row">
					<div className="col-xs-10 col-xs-offset-1">
						<div className="row navigator" id="general">
							<div className="col-xs-12">
								<GeneralInfo species={this.props.master.species} />
							</div>
						</div>
						<div className="row">
							<div className="col-xs-12">
								<Obligation
									obligations={this.props.master.obligations}
									additionalObligations={this.props.master.additionalObligations} />
							</div>
						</div>
						<div className="row">
							<div className="col-sm-6">
								<Career
									careers={this.props.master.careers}
									skills={this.props.master.skills} />
							</div>
							<div className="col-sm-6">
								<Specialization
									careers={this.props.master.careers}
									skills={this.props.master.skills} />
							</div>
						</div>
						<div className="row">
							<div className="col-xs-12">
								<AdditionalSpecialization
									careers={this.props.master.careers} />
							</div>
						</div>
						<div className="row navigator" id="characteristics">
							<div className="col-xs-12">
								<Characteristics characteristics={this.props.master.characteristics} />
							</div>
						</div>
						<div className="row navigator" id="skills">
							<div className="col-xs-12">
								<Skills skills={this.props.master.skills}
									characteristics={this.props.master.characteristics} />
							</div>
						</div>
						<div className="row navigator" id="equipment">
							<div className="col-xs-12">
								<div className="panel panel-default">
									<div className="panel-heading">
										<h3 className="panel-title"> Equipment </h3>
									</div>
									<div className="panel-body">
										Equipment
									</div>
								</div>
							</div>
						</div>
						
					</div>
				</div>
			</form>
		);
	}
});

var GeneralInfo = React.createClass({
	render: function() {
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">General information</h3>
				</div>
				<div className="panel-body">
					<NameInput />
					<SpeciesSelect species={this.props.species} />
				</div>
			</div>
		);
	}
});

var NameInput = React.createClass({
	render: function() {
		return (
			<div className="form-group">
				<label htmlFor="nameInput">Name</label>
				<input type="text" className="form-control input-sm" id="nameInput" placeholder="name your character" />
			</div>
		);
	}
});

var SpeciesSelect = React.createClass({
	render: function() {

		var options = this.props.species.map(function (item, index) {
			return (
				<option key={index}>{item.name}</option>
			);
		});

		return (
			<div className="form-group">
				<label htmlFor="speciesSelect">Species</label>
				<select className="form-control input-sm" id="speciesSelect">
					{options}
				</select>
			</div>
		);
	}
});

var Obligation = React.createClass({
	render: function() {
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Obligation</h3>
				</div>
				<div className="panel-body">
					<div className="col-sm-6">
						<ObligationTypeSelect obligations={this.props.obligations} />
						<ObligationSizeSelect />
					</div>
					<div className="col-sm-6">
						<AdditionalObligationCheckBoxes additionalObligations={this.props.additionalObligations} />
					</div>
				</div>
			</div>
		);
	}
});

var ObligationTypeSelect = React.createClass({
	render: function() {

		var options = this.props.obligations.map(function (item, index) {
			return (
				<option key={index}>{item.name}</option>
			);
		});

		return (
			<div className="form-group">
				<label htmlFor="obligationTypeSelect">Type</label>
				<select className="form-control input-sm" id="obligationTypeSelect">
					{options}
				</select>
			</div>
		);
	}
});

var ObligationSizeSelect = React.createClass({
	render: function() {
		return (
			<div className="form-group">
				<label htmlFor="obligationSizeSelect">Starting Value</label>
				<select className="form-control input-sm" id="speciesSelect">
					<option>20 (2 players)</option>
					<option>15 (3 players)</option>
					<option>10 (4-5 players)</option>
					<option>5  (6+ players)</option>
				</select>
			</div>
		);
	}
});

var AdditionalObligationCheckBoxes = React.createClass({
	render: function() {

		var checkBoxes = this.props.additionalObligations.map(function (item, index) {
			return (
				<div key={index} className="checkbox">
					<label>
						<input type="checkbox" value={index} />
						{item.name}
					</label>
				</div>
			);
		});

		return (
			<div className="form-group">
				<label htmlFor="additionalObligationCheckbox">Additional Obligation</label>
				<div id="additionalObligationCheckboxes">
					{checkBoxes}
				</div>
			</div>
		);
	}
});

var Career = React.createClass({
	render: function() {

		// this points to something else inside the map function,
		// so we create an alternate name for the stuff we use
		var skills = this.props.skills;
		//TODO selected career
		var selectedCareer = this.props.careers[0];
		
		var careerOptions = this.props.careers.map(function(item, index) {
			return (
				<option key={index}>{item.name}</option>
			);
		});

		var skillCheckBoxes = selectedCareer.skills.map(function (item, index) {
			return (
				<div key={index} className="checkbox">
					<label>
						<input type="checkbox" value={index} />{skills[item].name}</label>
				</div>
			);
		});

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Career</h3>
				</div>
				<div className="panel-body">
					<div className="form-group">
						<label htmlFor="CareerSelect">Name</label>
						<select className="form-control input-sm" id="CareerSelect">
							{careerOptions}
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="careerSkillCheckbox">Skills</label>
						<div id="careerSkillCheckbox">
							{skillCheckBoxes}
						</div>
					</div>
				</div>
			</div>
		);
	}
});

var Specialization = React.createClass({
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
				<option key={index}>{item.name}</option>
			);
		});

		var skillCheckBoxes = selectedSpecialization.skills.map(function(item, index) {
			return (
				<div key={index} className="checkbox">
					<label>
						<input type="checkbox" value={index} />{skills[item].name}</label>
				</div>
			);
		});

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Specialization</h3>
				</div>
				<div className="panel-body">
					<div className="form-group">
						<label htmlFor="SpecializationSelect">Name</label>
						<select className="form-control input-sm" id="SpecializationSelect">
							{specializationOptions}
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="specializationSkillCheckbox">Skills</label>
						<div id="specializationSkillCheckbox">
							{skillCheckBoxes}
						</div>
					</div>
				</div>
			</div>
		);
	}
});

var AdditionalSpecialization = React.createClass({
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
					<div key={specIndex} className={style}>
						<div className="checkBox">
							<label className="control-label">
								<input type="checkbox" value={specIndex} disabled={disabled} />{specialization.name}</label>
						</div>
					</div>
				);
			});
			return (
				<div key={careerIndex} className="row">
					{careerSpecs}
				</div>
			);
		});

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Additional Specializations</h3>
				</div>
				<div className="panel-body">
					{specializations}
				</div>
			</div>
		);
	}
});

var Characteristics = React.createClass({
	render: function() {
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Characteristics</h3>
				</div>
				<div className="panel-body">
					<div className="row">
						<div className="col-sm-4">
							<CharacteristicInput characteristic={this.props.characteristics[0]} />
						</div>
						<div className="col-sm-4">
							<CharacteristicInput characteristic={this.props.characteristics[1]} />
						</div>
						<div className="col-sm-4">
							<CharacteristicInput characteristic={this.props.characteristics[2]} />
						</div>
					</div>
					<div className="row">
						<div className="col-sm-4">
							<CharacteristicInput characteristic={this.props.characteristics[3]} />
						</div>
						<div className="col-sm-4">
							<CharacteristicInput characteristic={this.props.characteristics[4]} />
						</div>
						<div className="col-sm-4">
							<CharacteristicInput characteristic={this.props.characteristics[5]} />
						</div>
					</div>
				</div>
			</div>
		);
	}
});

var CharacteristicInput = React.createClass({
	render: function() {
		var chr = this.props.characteristic;
		return (
			<div className="form-group">
				<label htmlFor="{chr.abbr}">{chr.name} <small>[{chr.abbr}]</small></label>
				<input type="number" className="form-control input-sm" id="{chr.abbr}" min="2" max="5" defaultValue="2" />
			</div>
		);
	}
});

var Skills = React.createClass({
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
						<tr key={index}>
							<td>{item.name} <small>[{chars[item.chr].abbr}]</small> </td>
							<td>
								<input type="number"
									className="form-control input-sm input-sm"
									id={'skill-' + index}
									min="0" max="5" defaultValue="0" />
							</td>
							<td> YGG </td>
						</tr>
					);
			});
			allSkills.push(
				<div key={i} className={'col-sm-' + width}>
					<table className="table table-condensed form-horizontal">
						<thead>
							<tr>
								<th>Skill <small>[Char.]</small> </th>
								<th>Value</th>
								<th>Roll</th>
							</tr>
						</thead>
						<tbody>
							{skills}
						</tbody>
					</table>
				</div>
			);
		}
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title"> Skills </h3>
				</div>
				<div className="panel-body">
					<div className="row">
						{allSkills}
					</div>
				</div>
			</div>
		);
	}
});


// entry point

$.ajax({ url: "master.json", dataType: "json" })
	.done(function(master) {
		React.render(
			<CharacterGenerator master={master} />,
			document.getElementById('characterGenerator')
		);

		})
	.fail(function(request, status, exception) {
		alert('Request for ' + this.url + ' failed with: ' + exception.toString());
	});

var Template = React.createClass({
	render: function() {
		return (
			''
		);
	}
});
