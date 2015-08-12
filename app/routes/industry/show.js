import Ember from 'ember';
import ENV from '../../config/environment';
const {apiURL} = ENV;
const {RSVP, getWithDefault, $} = Ember;

export default Ember.Route.extend({
  employmentGrowthCalc: function(data) {
    let first = _.first(data);
    let last = _.last(data);
    let difference = last.employment / first.employment;
    let power =  1/(data.length-1);
    return (Math.pow(difference, power) - 1);
  },
  model: function(params) {
    var industriesMetadata = this.modelFor('application').industries;
    return this.store.find('industry', params.industry_id)
      .then((model) => {
        var groupIds = _.pluck(_.filter(industriesMetadata, 'parent_id', parseInt(model.id)), 'id');
        var classIndustries = _.filter(industriesMetadata, function(d) {
          return _.contains(groupIds, d.id);
        });
        return $.getJSON(`${apiURL}/data/industry?level=class`)
          .then((response) => {
            let data = _.groupBy(response.data, 'industry_id');
            let classData = _.reduce(classIndustries, (memo, d) => {
              let classData = data[d.id];
              if(!classData) { return memo; }

              let lastClassData = _.last(classData);
              d.employment_growth = this.employmentGrowthCalc(classData);
              d.avg_wage = lastClassData.wages / lastClassData.employment;
              memo.push(_.merge(d, lastClassData));
              return memo;
            },[]);

            return model.set('classIndustries', classData);
          });
      });
  },
  afterModel: function(model, transition) {
    var year = getWithDefault(transition, 'queryParams.year', 2013);

    var departments = $.getJSON(`${apiURL}/data/industry/${model.id}/participants?level=department`);
    var industries = $.getJSON(`${apiURL}/data/industry?level=division`);

    return RSVP.allSettled([departments, industries]).then((array) => {
      var departmentsData = getWithDefault(array[0], 'value.data', []);
      var industriesData = getWithDefault(array[1], 'value.data', []);

      let locationsMetadata = this.modelFor('application').locations;
      let industriesMetadata = this.modelFor('application').industries;

      //get products data for the department
      let departments = _.reduce(departmentsData, (memo, d) => {
        if(getWithDefault(d, 'year', 0) === year){
          let department  = locationsMetadata[d.department_id];
          memo.push(_.merge(d, department));
        }
        return memo;
      },[]);

      let industries = _.map(industriesData, function(d) {
        d.avg_wage = d.wages/d.employment;
        return  _.merge(d, industriesMetadata[d.industry_id]);
      });

      model.set('departmentsData', departments);
      model.set('industriesData', industries);
      return model;
    });
  },
  setupController(controller, model) {
    this._super(controller, model);
    this.controllerFor('application').set('entity', model.get('constructor.modelName'));
    this.controllerFor('application').set('entity_id', model.get('id'));
    window.scrollTo(0, 0);
  },
});

