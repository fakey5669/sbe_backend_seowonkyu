-- 사용자 테이블
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    department VARCHAR(50),
    position VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 결재 문서 테이블
CREATE TABLE approval_documents (
    document_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    content TEXT,
    requester_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(user_id)
);

-- 결재 승인 단계 테이블
CREATE TABLE approval_steps (
    step_id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    approver_id INT NOT NULL,
    step_order INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    comment TEXT,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (document_id) REFERENCES approval_documents(document_id),
    FOREIGN KEY (approver_id) REFERENCES users(user_id)
); 