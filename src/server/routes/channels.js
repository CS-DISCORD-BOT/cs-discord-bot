const router = require("express").Router();
const { getChannels } = require("../api/api");

router.get("/", async (req, res) => {
  try {
    const channels = await getChannels();
    res.send(channels);
  }
  catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;