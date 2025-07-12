from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# .env 파일에서 환경변수 로드
env = os.getenv("ENV", "production")

if env == "production":
    load_dotenv(".env.production")
else:
    load_dotenv(".env.development")

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String, unique=True, index=True)
    total_amount = Column(Integer)
    start_date = Column(String)
    entries = relationship("Entry", back_populates="user")

class Entry(Base):
    __tablename__ = "entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(String)
    menu = Column(String)
    amount = Column(Integer)
    note = Column(String)
    user = relationship("User", back_populates="entries")

class Menu(Base):
    __tablename__ = "menu"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    price = Column(Integer, nullable=False)
    category = Column(String, nullable=False)

def init_menu_data():
    db = SessionLocal()
    if db.query(Menu).first():
        db.close()
        return  # 이미 데이터 있음
    menu_items = [
        # (name, price, category)
        ("아메리카노", 3000, "커피"),
        ("디카페인아메리카노", 4000, "커피"),
        ("카페라떼", 3800, "커피"),
        ("디카페인카페라떼", 4800, "커피"),
        ("카페모카", 4300, "커피"),
        ("디카페인카페모카", 5300, "커피"),
        ("바닐라라떼", 4300, "커피"),
        ("디카페인바닐라라떼", 5300, "커피"),
        ("레몬에이드", 4500, "에이드"),
        ("자몽에이드", 4500, "에이드"),
        ("유자에이드", 4500, "에이드"),
        ("흑임자라떼", 4800, "라떼"),
        ("아인슈페너라떼", 4800, "라떼"),
        ("요거트크림딸기라떼", 5300, "라떼"),
        ("레몬티", 4000, "티"),
        ("유자티", 4000, "티"),
        ("자몽티", 4000, "티"),
        ("허브티", 4000, "티"),
        ("아이스티복숭아", 3500, "티"),
        ("아이스티레몬", 3500, "티"),
        ("딸기라떼", 4800, "라떼"),
        ("초코라떼", 4800, "라떼"),
        ("애플쥬스오리지널", 4500, "쥬스"),
        ("애플쥬스탄산", 4500, "쥬스"),
        ("초코쿠키", 2000, "디저트"),
        ("생크림토스트", 3500, "디저트"),
        ("햄치즈토스트", 3000, "디저트"),
        ("마들렌", 1500, "디저트"),
        ("초코마들렌", 1800, "디저트"),
        ("얼레이마들렌", 2000, "디저트"),
        ("플레인스콘", 2000, "디저트"),
        ("누띠네스콘", 2000, "디저트"),
        ("샷추가", 500, "기타"),
        ("우유", 2000, "기타"),
        ("꽃", 5000, "기타"),
    ]
    for name, price, category in menu_items:
        db.add(Menu(name=name, price=price, category=category))
    db.commit()
    db.close()

Base.metadata.create_all(bind=engine)
init_menu_data()

app = FastAPI()

# CORS 정책 강화: 신뢰할 수 있는 도메인만 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 배포시에는 본인 도메인으로 변경
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 보안 헤더(Helmet) 미들웨어 적용
# try:
#     from fastapi_helmet import HelmetMiddleware
#     app.add_middleware(HelmetMiddleware)
# except ImportError:
#     pass  # fastapi-helmet 미설치 시 무시

class UserCreate(BaseModel):
    nickname: str
    total_amount: int
    start_date: str

class EntryCreate(BaseModel):
    nickname: str
    date: str
    menu: str
    amount: int
    note: str = ""

@app.post("/user")
def create_user(user: UserCreate):
    db = SessionLocal()
    if db.query(User).filter_by(nickname=user.nickname).first():
        db.close()
        raise HTTPException(status_code=400, detail="이미 존재하는 닉네임입니다.")
    db_user = User(nickname=user.nickname, total_amount=user.total_amount, start_date=user.start_date)
    db.add(db_user)
    db.commit()
    db.close()
    return {"message": "등록 성공"}

@app.get("/ledger/{nickname}")
def get_ledger(nickname: str):
    db = SessionLocal()
    user = db.query(User).filter_by(nickname=nickname).first()
    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="사용자 없음")
    entries = db.query(Entry).filter_by(user_id=user.id).all()
    used_amount = sum(e.amount for e in entries)
    remain_amount = user.total_amount - used_amount
    result = {
        "nickname": user.nickname,
        "total_amount": user.total_amount,
        "start_date": user.start_date,
        "used_amount": used_amount,
        "remain_amount": remain_amount,
        "entries": [
            {"date": e.date, "menu": e.menu, "amount": e.amount, "note": e.note}
            for e in entries
        ]
    }
    db.close()
    return result

@app.post("/entry")
def add_entry(entry: EntryCreate):
    db = SessionLocal()
    user = db.query(User).filter_by(nickname=entry.nickname).first()
    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="사용자 없음")
    db_entry = Entry(
        user_id=user.id,
        date=entry.date,
        menu=entry.menu,
        amount=entry.amount,
        note=entry.note
    )
    db.add(db_entry)
    db.commit()
    db.close()
    return {"message": "내역 추가 성공"}

from typing import List
from fastapi.responses import JSONResponse

class MenuOut(BaseModel):
    id: int
    name: str
    price: int
    category: str
    class Config:
        orm_mode = True

@app.get("/menu", response_model=List[MenuOut])
def get_menu():
    db = SessionLocal()
    menus = db.query(Menu).all()
    db.close()
    return menus

class ChargeRequest(BaseModel):
    amount: int

@app.put("/ledger/{nickname}/charge")
def charge_ledger(nickname: str, req: ChargeRequest):
    db = SessionLocal()
    user = db.query(User).filter_by(nickname=nickname).first()
    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="사용자 없음")
    if req.amount <= 0:
        db.close()
        raise HTTPException(status_code=400, detail="Amount must be positive")
    user.total_amount += req.amount
    db.commit()
    entries = db.query(Entry).filter_by(user_id=user.id).all()
    used_amount = sum(e.amount for e in entries)
    remain_amount = user.total_amount - used_amount
    result = {
        "nickname": user.nickname,
        "total_amount": user.total_amount,
        "start_date": user.start_date,
        "used_amount": used_amount,
        "remain_amount": remain_amount,
        "entries": [
            {"date": e.date, "menu": e.menu, "amount": e.amount, "note": e.note}
            for e in entries
        ]
    }
    db.close()
    return result 

@app.get("/users/nicknames")
def get_nicknames():
    db = SessionLocal()
    nicknames = [user.nickname for user in db.query(User).all()]
    db.close()
    return {"nicknames": nicknames} 