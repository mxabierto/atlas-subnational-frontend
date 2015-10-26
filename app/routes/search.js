import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    query: { refreshModel: true },
    filter: { refreshModel: true }
  },
  model(transition) {
    var country = this.store.find('location', { level: 'country' });
    var department = this.store.find('location', { level: 'department' });
    var msa = this.store.find('location', { level: 'msa' });
    var municipality = this.store.find('location', { level: 'municipality' });

    var products = this.store.find('product', { level: '4digit' });

    var industriesDivision = this.store.find('industry', { level: 'division' });
    var industriesClass = this.store.find('industry', { level: 'class' });

    var request = [];

    if(transition.filter === 'location'){
<<<<<<< HEAD
      request = [locations];
=======
      request = [country, department, msa, municipality];
>>>>>>> 3b026d7fdf30a2d58c05eee3f89ed7aa3f1f13b0
    } else if(transition.filter === 'industry') {
      request = [industriesDivision, industriesClass];
    } else if(transition.filter === 'product') {
      request = [products];
<<<<<<< HEAD
=======
    } else {
      request = [industriesDivision, industriesClass, country, department, msa, municipality, products];
>>>>>>> 3b026d7fdf30a2d58c05eee3f89ed7aa3f1f13b0
    }

    if(transition.query) {
      return Ember.RSVP.all(request)
        .then(function(array) {
          return _.chain(array)
            .map(function(d){ return d.content; })
            .flatten()
            .value();
        },function() {
          return [];
        });
    }
    return [];
  },
  deactivate: function() {
    this.controller.set('search', null);
  },
  actions: {
    query: function(query) {
      if(query) {
        this.transitionTo('search', { queryParams: { query: query }});
      } else {
        this.transitionTo('search', { queryParams: { query: null }});
      }
    }
  }
});

