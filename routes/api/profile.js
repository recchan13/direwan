const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/user');

// @route   GET API/profile/me
// @desc    Get Current user profile
// Route    untuk user nambah apapun 
// @access  Private
router.get('/me', auth, async (req , res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user',
        ['name', 'avatar']);

        if(!profile){
            return res.status(400).json({msg:'There is no Profile for this User'})
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
// @route   PSOT API/profile
// @desc    Create or Update User profiles 
// @access  Private
router.post('/',[auth, [
    check('status', 'Status is Required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {
        location,
        website,
        bio,
        skills,
        status,
        githubusername,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
      } = req.body;
    
      // Build Profile Object
      const profileFields = {};
      profileFields.user = req.user.id;
      if(location) profileFields.location = location;
      if(bio) profileFields.bio = bio;
      if(status) profileFields.status = status;
      if(githubusername) profileFields.githubusername = githubusername;
      if(website) profileFields.website = website;
      if(skills){
          profileFields.skills = skills.split(',').map(skill => skill.trim());
      }

      //build social array
      profileFields.social = {}
      if(youtube) profileFields.social.youtube = youtube;
      if(linkedin) profileFields.social.linkedin = linkedin;
      if(instagram) profileFields.social.instagram = instagram;
      if(facebook) profileFields.social.facebook = facebook;
      if(twitter) profileFields.social.twitter = twitter;

      
      try {
          let profile = await Profile.findOne({user: req.user.id});

          if(profile){
            //update
            profile = await Profile.findOneAndUpdate({user: req.user.id},
            {$set: profileFields},
            {new: true}
            );

            return res.json(profile);
          }

          //Create
          profile = new Profile(profileFields);
          await profile.save();
          res.json(profile);
      } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error');
      }
});

// @route   GET API/profile
// @desc    Get All Profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find(). populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET API/profile/user/user_id
// @desc    Get Profiles by user id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}). populate('user', ['name', 'avatar']);
        if(!profile) return res.status(400).json({msg:'There is no profile for this user'});
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.name == 'CastError'){
            return res.status(400).json({msg:'Profile Not Found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE API/profile
// @desc    Delete Profile, user and Posts
// @access  PPrivate
router.delete('/', auth,  async (req, res) => {
    try {
        //@todo -- Remove users post
        //remove Profile
        await Profile.findOneAndRemove({user: req.user.id});
        //Remove User
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg:'User Removed!'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;