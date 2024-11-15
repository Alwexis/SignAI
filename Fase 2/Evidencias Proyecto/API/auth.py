from db import db
from models import Plan, User, _User

plans = {
    'Hobby': Plan(name='Hobby', quota={ 'voice_to_sign': 100, 'video_to_text': 20 }),
    'Pro': Plan(name='Pro', quota={ 'voice_to_sign': 500, 'video_to_text': 200 }),
    'Enterprise': Plan(name='Enterprise', quota={ 'voice_to_sign': 10000, 'video_to_text': 10000 })
}

def check_if_user_exists(uid: str):
    user = db.users.find_one({ 'uid': uid })
    return user is not None

def register_user_if_not_exist(user: _User):
    if not check_if_user_exists(user.uid):
        _user = User(
            uid=user.uid,
            provider=user.provider,
            name=user.name,
            email=user.email,
            plan=plans['Hobby'],
            quota={ 'voice_to_sign': 100, 'video_to_text': 20 },
            last_request=None,
            api_keys=[]
        )
        db.users.insert_one(_user.model_dump())
        return True
    return False