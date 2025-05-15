-- 특정 사용자가 처리해야 할 결재 건 조회 쿼리
SELECT 
    ad.document_id,
    ad.title,
    ad.content,
    u.username AS requester_name,
    u.department AS requester_department,
    ad.created_at AS requested_at,
    ast.step_order
FROM 
    approval_documents ad
JOIN 
    users u ON ad.requester_id = u.user_id
JOIN 
    approval_steps ast ON ad.document_id = ast.document_id
WHERE 
    ast.approver_id = ? -- 현재 사용자 ID를 파라미터로 전달
    AND ast.status = 'pending' -- 아직 처리되지 않은 결재 단계
    AND (
        -- 현재 단계가 첫 번째이거나
        ast.step_order = 1
        OR
        -- 이전 단계가 모두 승인된 경우
        (SELECT COUNT(*) FROM approval_steps prev 
         WHERE prev.document_id = ast.document_id 
           AND prev.step_order < ast.step_order 
           AND prev.status != 'approved') = 0
    )
ORDER BY 
    ad.created_at ASC; 