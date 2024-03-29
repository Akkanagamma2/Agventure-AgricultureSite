const { I, homePage } = inject();
var should = require('should'); // eslint-disable-line

Given('shopper lands on the expected category landing page', () => {
    I.amOnPage('/on/demandware.store/Sites-Agventure-Site/default/SourceCodeRedirect-Start?src=subscription10');
    homePage.accept();
});

Then('shopper sees all the category landing page related information', async () => {
    (await I.grabTextFrom('.page-title')).trim().should.equal('Flat Screen');
});
