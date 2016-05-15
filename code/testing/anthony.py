
from testing.base import *


class SimpleAdd(OverWatchTest):
    def to_insert(self):
        return [
            # Wall: without a wall a user cant be initialized
            model.Wall(is_user=True),
            # Users
            model.User(first_name="Evert", last_name="Heylen", email="e@e", password="testtest", admin=False, wall=1),
            model.User(first_name="Anthony", last_name="Hermans", email="a@a", password="seeecret", admin=False, wall=1)
        ]

    @ow_test
    async def test_users(self):
        e = await model.User.find_by_key(1, self.db)
        a = await model.User.find_by_key(2, self.db)
        self.assertEqual(e.first_name, "Evert")
        self.assertEqual(a.first_name, "Anthony")

class SimpleEdit(OverWatchTest):
    def to_insert(self):
        return [
            # Wall
            model.Wall(is_user=True),
            # User
            model.User(first_name="Anthony", last_name="Hermans", email="a@a", password="seeecret", admin=False, wall=1),
            # Location
            model.Location(user=1, description="Location 1", number=4, street="Bist", city="Lier", postalcode=2000, country="Belgium", elec_price=12.45),
            # Sensor
            model.Sensor(type="electricity", title="Measure shit 1", user= 1, location=1,EUR_per_unit=6.69)
        ]

    @ow_test
    async def test_edit(self):
        a = await model.User.find_by_key(1, self.db)
        l = await model.Location.find_by_key(1, self.db)
        s = await model.Sensor.find_by_key(1, self.db)
        self.assertEqual(a.first_name, "Anthony")
        self.assertEqual(l.user, 1)
        self.assertEqual(s.type, "electricity")
        s.edit_from_json({"type": "gas", "title": "Measure more shit 2", "user_UID": 1, "location_LID": 1})
        await s.update(self.db)
        self.assertEqual(s.type, "gas")
        self.assertEqual(s.title, "Measure more shit 2")

class SocialTab(OverWatchTest):
        def to_insert(self):
            return [
                # Walls
                model.Wall(is_user=True),
                model.Wall(is_user=True),
                model.Wall(is_user=True),
                # Group
                model.Group(title="The swaggionistas",description="A group for fashionista's with an infinity of SWAG",wall=1, public=True),
                # Users
                model.User(first_name="Anthony", last_name="Hermans", email="a@a", password="seeecret", admin=False, wall=1),
                model.User(first_name="Evert", last_name="Heylen", email="e@a", password="seeecret", admin=False, wall=2),
                model.User(first_name="Stijn", last_name="Janssens", email="s@a", password="seeecret", admin=False, wall=3),
                # Location
                model.Location(user=1, description="Location 1", number=4, street="Bist", city="Lier", postalcode=2000, country="Belgium", elec_price=12.45),
                # Sensor
                model.Sensor(type="electricity", title="Measure shit 1", user= 1, location=1,EUR_per_unit=6.69),
                # Tag
                model.Tag(description="ik zen een specialleke",sensor=1),
                # Friendship
                model.Friendship(user1=1,user2=2),
                # Status
                model.Status(author=1,wall=1,date=30,date_edited=30,text="Blah"),
                # Membership
                model.Membership(status="MEMBER",user=1,group=1,last_change=1),
                # Like
                model.Like(status=1,user=2,positive=True)
            ]

        @ow_test
        async def test_social(self):
            # General tests
            a = await model.User.find_by_key(1, self.db)
            e = await model.User.find_by_key(2, self.db)
            l = await model.Location.find_by_key(1, self.db)
            s = await model.Sensor.find_by_key(1, self.db)
            w = await model.Wall.find_by_key(1, self.db)
            t = await model.Tag.find_by_key(1, self.db)
            self.assertEqual(a.first_name, "Anthony")
            self.assertEqual(e.first_name, "Evert")
            self.assertEqual(s.EUR_per_unit,6.69)

            # Social tests
            f = await model.Friendship.find_by_key((1,2),self.db)
            mem = await model.Membership.find_by_key((1,1),self.db)
            stat = await model.Status.find_by_key(1,self.db)
            like = await model.Like.find_by_key((1,2),self.db)

            # Friendship tests here
            # weird notation here (1,) ?
            self.assertEqual(f.user1, 1)
            self.assertEqual(f.user2, 2)
            # Make frienship between Anthony and Stijn
            await model.Friendship.make_friend(1,3,self.db)
            # Now deletes this latest Friendship
            await model.Friendship.unfriend(1,3,self.db)

            # Like tests here
            self.assertEqual(like.status,1)

            # Membership tests here
            self.assertEqual(mem.status, "MEMBER")
            self.assertEqual(mem.user,1)
            self.assertEqual(mem.group, 1)

