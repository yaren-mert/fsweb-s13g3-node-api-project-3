const express = require("express");
const middleware = require("../middleware/middleware");
const userModel = require("./users-model");
const postModel = require("../posts/posts-model");
const { use } = require("../server");

// `users-model.js` ve `posts-model.js` sayfalarına ihtiyacınız var
// ara yazılım fonksiyonları da gereklidir

const router = express.Router();

router.get("/", (req, res) => {
  // TÜM KULLANICILARI İÇEREN DİZİYİ DÖNDÜRÜN
  userModel
    .get()
    .then((users) => {
      res.json(users);
    })
    .catch((error) => {
      next(error);
    });
});

router.get("/:id", middleware.validateUserId, (req, res, next) => {
  // USER NESNESİNİ DÖNDÜRÜN
  // user id yi getirmek için bir ara yazılım gereklidir
  res.json(req.user);
});

router.post("/", middleware.validateUser, (req, res, next) => {
  // YENİ OLUŞTURULAN USER NESNESİNİ DÖNDÜRÜN
  // istek gövdesini doğrulamak için ara yazılım gereklidir.
  userModel
    .insert({ name: req.name })
    .then((insertedUser) => {
      res.json(insertedUser);
    })
    .catch(next);
});

router.put(
  "/:id",
  middleware.validateUserId,
  middleware.validateUser,
  async (req, res, next) => {
    // YENİ GÜNCELLENEN USER NESNESİNİ DÖNDÜRÜN
    // user id yi doğrulayan ara yazılım gereklidir
    // ve istek gövdesini doğrulayan bir ara yazılım gereklidir.
    try {
      await userModel.update(req.params.id, { name: req.name });
      let updated = await userModel.getById(req.params.id);
      res.status(201).json(updated);
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", middleware.validateUserId, async (req, res, next) => {
  // SON SİLİNEN USER NESNESİ DÖNDÜRÜN
  // user id yi doğrulayan bir ara yazılım gereklidir.
  try {
    await userModel.remove(req.params.id);
    res.json(req.user);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/posts", middleware.validateUserId, async (req, res, next) => {
  // USER POSTLARINI İÇEREN BİR DİZİ DÖNDÜRÜN
  // user id yi doğrulayan bir ara yazılım gereklidir.
  try {
    let userPosts = await userModel.getUserPosts(req.params.id);
    res.json(userPosts);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:id/posts",
  middleware.validateUserId,
  middleware.validatePost,
  async (req, res, next) => {
    // YENİ OLUŞTURULAN  NESNESİNİ DÖNDÜRÜN
    // user id yi doğrulayan bir ara yazılım gereklidir.
    // ve istek gövdesini doğrulayan bir ara yazılım gereklidir.
    try {
      let insertedPost = await postModel.insert({
        user_id: req.params.id,
        text: req.text,
      });
      res.json(insertedPost);
    } catch (error) {
      next(error);
    }
  }
);

router.use((err, res, req) => {
  res.status(err.status || 500).json({
    customMessage: "Bir hata oluştu",
    message: err.message,
  });
});

module.exports = router;

// routerı dışa aktarmayı unutmayın
