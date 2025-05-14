const app = require('../../app/app');
const chai = require('chai');
const expect = require('chai').expect;
const utils = require('./utils');
const fs = require('fs');
const sinon = require('sinon');
const mediaEncoding = require('../../app/media/encoding');

chai.use(require('chai-http'));
chai.use(require('chai-arrays'));

const VIDEO_URI = '/videos';

describe('Get videos: ', () => {

    /**
     * Populate database with some data before all the tests in this suite.
     */
    before(async () => {        
        await utils.populateVideos();
    });

    /**
     * This is run once after all the tests.
     */
    after(async () => {
        await utils.dropVideos();
    });

    /**
     * Get all videos correctly
     */
    it('should get all videos', (done) => {
        chai.request(app)
            .get(VIDEO_URI)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.array();
                expect(res.body.length).to.equal(2);
                done();
            });
    });

    /**
     * Get an existing video correctly
     */
    it('should get a video', (done) => {
        chai.request(app)
            .get(VIDEO_URI + '/2')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.id).to.be.equal(2);
                expect(res.body.title).to.be.equal('Otro video');
                expect(res.body.creator).to.be.equal('multimedia');
                expect(res.body.description).to.be.equal('hellos');
                done();
            });
    });

    /**
     * Get the lastest video correctly
     */
    
    it('should get the latest video', (done) => {
    chai.request(app)
        .get(VIDEO_URI + '/latest')
        .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body.id).to.be.equal(2);
            expect(res.body.title).to.be.equal('Otro video');
            expect(res.body.creator).to.be.equal('multimedia');
            expect(res.body.description).to.be.equal('hellos');
            done();
        });
    });
    
});

// Auth token
let token;

describe('Create videos: ', () => {

    /**
     * Populate database with some data before all the tests in this suite.
     */
    before(async () => {
        await utils.populateVideos();
        await utils.populateUsers();
        token = await utils.login('Username1', 'Password1');
    });

    /**
     * This is run once after all the tests.
     */
    after(async () => {
        await utils.dropVideos();
        await utils.dropUsers();
    });

    /**
     * A video should be created correctly
     */
    it('should create a valid video', (done) => {
        const title = "tikitoki";
        const creator = "room806";
        const description = "video for a test";
        chai.request(app)
            .post(VIDEO_URI)
            .set('Authorization', 'Bearer ' + token)
            .send({ title: title, creator: creator, description: description })
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body.title).to.be.equal(title);
                expect(res.body.creator).to.be.equal(creator);
                expect(res.body.id).to.be.equal(3);
                done();
            });
    });

    /**
     * An invalid title should raise an error
     */
    it('should receive an error with an invalid title', (done) => {
        chai.request(app)
            .post(VIDEO_URI)
            .set('Authorization', 'Bearer ' + token)
            .send({ title:"", creator: "Unknown", description: "whatever" })
            .end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
    });

    /**
     * A missing title should raise an error
     */
    it('should receive an error with missing name', (done) => {
        chai.request(app)
            .post(VIDEO_URI)
            .set('Authorization', 'Bearer ' + token)
            .send({ creator: "Unknown", description: "whatever" })
            .end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
    });

    /**
     * An invalid creator should raise an error
     */
    it('should receive an error with an invalid creator', (done) => {
        chai.request(app)
            .post(VIDEO_URI)
            .set('Authorization', 'Bearer ' + token)
            .send({ title:"A valid title", creator: "No", description: "valid desc" })
            .end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
    });

    /**
     * A missing creator should raise an error
     */
    it('should receive an error with missing creator', (done) => {
        chai.request(app)
            .post(VIDEO_URI)
            .set('Authorization', 'Bearer ' + token)
            .send({ title: "A valid title", description: "a valid desc" })
            .end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
    });

    /**
     * An invalid description should raise an error
     */
    it('should receive an error with an invalid description', (done) => {
        chai.request(app)
            .post(VIDEO_URI)
            .set('Authorization', 'Bearer ' + token)
            .send({ title:"A valid title", creator: "A valid creator", description: "no" })
            .end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
    });

    /**
     * A missing description should raise an error
     */
    it('should receive an error with missing description', (done) => {
        chai.request(app)
            .post(VIDEO_URI)
            .set('Authorization', 'Bearer ' + token)
            .send({ title: "A valid title", creator: "a valid creator" })
            .end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
    });
});

describe('Upload videos: ', () => {

    /**
     * Populate database with some data before all the tests in this suite.
     */
    before(async () => {
        await utils.populateVideos();
        await utils.populateUsers();
        token = await utils.login('Username1', 'Password1');
        // Mock normalize function
        sinon.stub(mediaEncoding, 'normalize').resolves('/reels/reel-2.mp4'); // Do nothing
    });

    /**
     * This is run once after all the tests.
     */
    after(async () => {
        await utils.dropVideos();
        await utils.dropUsers();
        // Restore normalize function
        mediaEncoding.normalize.restore();
    });

    /**
     * A video should be uploaded correctly
     */
    it('should upload a video', (done) => {
        chai.request(app)
            .post(VIDEO_URI + '/2/upload')
            .set('Authorization', 'Bearer ' + token)
            .attach('reelFile', fs.readFileSync('./test/assets/default.mp4'), 'default.mp4')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.id).to.be.equal(2);
                expect(res.body.title).to.be.equal('Otro video');
                expect(res.body.creator).to.be.equal('multimedia');
                expect(res.body.description).to.be.equal('hellos');
                expect(res.body.thumbnail).to.be.equal('/thumbnails/default.png');
                expect(res.body.reel).to.be.equal('/reels/reel-2.mp4');
                done();
            });
    }).timeout(5000);  // Timeout 5 secs


    /**
     * TODO: tests for invalid upoloads
     */
});

describe('Upload video thumbnails: ', () => {

    /**
     * Populate database with some data before all the tests in this suite.
     */
    before(async () => {
        await utils.populateVideos();
        await utils.populateUsers();
        token = await utils.login('Username1', 'Password1');
        // Mock normalize function
        sinon.stub(mediaEncoding, 'normalize').resolves('/thumbnails/thumbnail-2.png'); // Do nothing
    });

    /**
     * This is run once after all the tests.
     */
    after(async () => {
        await utils.dropVideos();
        await utils.dropUsers();
        // Restore normalize function
        mediaEncoding.normalize.restore();
    });

    /**
     * A video thumbnail should be uploaded correctly
     */
    
    it('should upload a video thumbnail', (done) => {
        chai.request(app)
            .post(VIDEO_URI + '/2/uploadthumbnail')
            .set('Authorization', 'Bearer ' + token)
            .attach('thumbnailFile', fs.readFileSync('./test/assets/default.png'), 'thumbnail.png')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.id).to.be.equal(2);
                expect(res.body.title).to.be.equal('Otro video');
                expect(res.body.creator).to.be.equal('multimedia');
                expect(res.body.description).to.be.equal('hellos');
                expect(res.body.thumbnail).to.be.equal('/thumbnails/thumbnail-2.png');
                expect(res.body.reel).to.be.equal('/reels/default.mp4');
                done();
            });
    }).timeout(5000);  // Timeout 5 secs
    /*
    it('should upload a short video', (done) => {
        chai.request(app)
            .post(VIDEO_URI + '/2/upload')
            .set('Authorization', 'Bearer ' + token)
            .attach('reelFile', fs.readFileSync('./test/assets/reel.mp4'), 'reel.mp4')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.id).to.be.equal(2);
                expect(res.body.title).to.be.equal('Otro video');
                expect(res.body.creator).to.be.equal('multimedia');
                expect(res.body.description).to.be.equal('hellos');
                expect(res.body.thumbnail).to.be.equal('/thumbnails/thumbnail-2.png');
                expect(res.body.reel).to.be.equal('/reels/reel-2.mp4');
                done();
            });
    }).timeout(5000);  // Timeout 5 secs
    */

    /**
     * TODO: tests for invalid upoloads
     */
});