'use strict'

var CharacterGenerator = React.createClass({

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
				<option key={index} value={index}>{item.name}</option>
			);
		});

		return (
			<form>
				<div className="row">
					<div className="col-xs-10 col-xs-offset-1">
						<div className="row navigator" id="general">
							<div className="col-xs-12">
								<div className="panel panel-default">
									<div className="panel-heading">
										<h3 className="panel-title">General information</h3>
									</div>
									<div className="panel-body">
										<div className="form-group">
											<label htmlFor="nameInput">Name</label>
											<input type="text" className="form-control input-sm" id="nameInput" placeholder="name your character"
													value={this.state.name} onChange={this.onNameChange}/>
										</div>
										<div className="form-group">
											<label htmlFor="speciesSelect">Species</label>
											<select className="form-control input-sm" id="speciesSelect"
													value={this.state.species} onChange={this.onSpeciesChange}>
												{speciesOptions}
											</select>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="col-xs-12">
								<Obligation
										obligations={this.props.master.obligations}
										additionalObligations={this.props.master.additionalObligations}
										obligation={this.state.obligation}
										onTypeChange={this.onObligationTypeChange}
										onValueChange={this.onObligationValueChange}
										onAdditionalChange={this.onAdditionalObligationChange} />
							</div>
						</div>
						<div className="row">
							<div className="col-sm-6">
								<Career
										careers={this.props.master.careers}
										skillList={this.props.master.skills}
										career={this.state.career}
										skills={this.state.skills}
										onCareerChange={this.onCareerChange}
										onCareerSkillChange={this.onCareerSkillChange} />
							</div>
							<div className="col-sm-6">
								<Specialization
										careers={this.props.master.careers}
										specializations={this.props.master.specializations}
										skillList={this.props.master.skills}
										career={this.state.career}
										specialization={this.state.specialization}
										skills={this.state.skills}
										onSpecializationChange={this.onSpecializationChange}
										onSpecSkillChange={this.onSpecSkillChange} />
							</div>
						</div>
						<div className="row">
							<div className="col-xs-12">
								<AdditionalSpecializations
										careers={this.props.master.careers}
										specializations={this.props.master.specializations}
										career={this.state.career}
										specialization={this.state.specialization}
										additionalSpecializations={this.state.additionalSpecializations}
										onClick={this.onAdditionalSpecializationClick} />
								{JSON.stringify(this.xp())}
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

var Obligation = React.createClass({
	render: function() {

		var typeOptions = this.props.obligations.map(function(item, index) {
			return (
				<option key={index} value={index}>{item.name}</option>
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
				<div key={index} className={disable ? "checkbox disabled" : "checkbox"}>
					<label>
						<input type="checkbox" value={index} checked={addStatus} disabled={disable}
							onChange={this.props.onAdditionalChange} />
						{item.name}
					</label>
				</div>
			);
		}, this);

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Obligation</h3>
				</div>
				<div className="panel-body">
					<div className="col-sm-6">
						<div className="form-group">
							<label htmlFor="obligationTypeSelect">Type</label>
							<select className="form-control input-sm" id="obligationTypeSelect"
								value={this.props.obligation.type} onChange={this.props.onTypeChange}>
								{typeOptions}
							</select>
						</div>
						<div className="form-group">
							<label htmlFor="obligationSizeSelect">Starting Value</label>
							<select className="form-control input-sm" id="speciesSelect"
								value={this.props.obligation.value} onChange={this.props.onValueChange}>
								<option value="20">20 (2 players)</option>
								<option value="15">15 (3 players)</option>
								<option value="10">10 (4-5 players)</option>
								<option value="5" >5  (6+ players)</option>
							</select>
						</div>
					</div>
					<div className="col-sm-6">
						<div className="form-group">
							<label htmlFor="additionalObligationCheckbox">Additional Obligation</label>
							<div id="additionalObligationCheckboxes">
								{checkBoxes}
							</div>
						</div>
					</div>
				</div>
				<div className="panel-footer">
					Total obligation: {(this.props.obligation.value + totalAdditional)}
				</div>
			</div>
		);
	}
});

var Career = React.createClass({
	render: function() {

		var careerOptions = this.props.careers.map(function(item, index) {
			return (
				<option key={index} value={index}>{item.name}</option>
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
				<div key={item} className={disable ? "checkbox disabled" : "checkbox"}>
					<label>
						<input type="checkbox" value={item}
								checked={status} disabled={disable}
								onChange={onChange}/>
						{skillList[item].name}
					</label>
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
						<select className="form-control input-sm" id="CareerSelect"
								value={this.props.career} onChange={this.props.onCareerChange}>
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
				<div className="panel-footer">
					Skills selected: {count} / {total}
				</div>
			</div>
		);
	}
});

var Specialization = React.createClass({
	render: function() {
		var selectedCareer = this.props.careers[this.props.career];
		var specs = this.props.specializations;

		var specializationOptions	= selectedCareer.specializations.map(function(item) {
			return (
				<option key={item} value={item}>{specs[item].name}</option>
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
				<div key={item} className={disable ? "checkbox disabled" : "checkbox"}>
					<label>
						<input type="checkbox" value={item}
								checked={status} disabled={disable}
								onChange={onChange} />
						{skillList[item].name}
					</label>
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
						<select className="form-control input-sm" id="SpecializationSelect"
								value={this.props.specialization} onChange={this.props.onSpecializationChange}>
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
				<div className="panel-footer">
					Skills selected: {count} / {total}
				</div>

			</div>
		);
	}
});

var AdditionalSpecializations = React.createClass({
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
					<div key={specialization} className="col-sm-3">
						<button type="button" value={specialization} className={style} disabled={disable}
								onClick={onClick}>
							{specs[specialization].name}
						</button>
					</div>
				);
			});

			return (
				<div key={careerIndex} className="row">
					<div className="col-sm-3">{career.name}</div>
					{cells}
				</div>
			);
		});

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Additional Specializations</h3>
				</div>
				<div className="panel-body">
					{rows}
				</div>
				<div className="panel-footer">
					<div className="row">
						<div className="col-sm-3">XP Spent:</div>
						<div className="col-sm-9"><XPBar /></div>
					</div>
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

var XPBar = React.createClass({
	render: function() {

		return (
			<div className="progress">
				<div className="progress-bar progress-bar-info" role="progressbar" style={{width: "10%"}} />
				<div className="progress-bar progress-bar-info" role="progressbar" style={{width: "30%"}} />
				<div className="progress-bar progress-bar-danger" role="progressbar" style={{width: "20%"}} />
				<div className="progress-bar progress-bar-info" role="progressbar" style={{width: "20%"}} />
			</div>
		);
	}
});

// entry point

$.ajax({ url: "master.json", dataType: "json" })
	.done(function(master) {
		React.render( <CharacterGenerator master={master} /> , document.getElementById("characterGenerator"));
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
